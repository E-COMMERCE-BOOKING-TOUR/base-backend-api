import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import {
    BookingStatus,
    PaymentStatus,
    BookingSummaryDTO,
    BookingItemDetailDTO,
} from '../dto/booking.dto';
import { UserEntity } from '@/module/user/entity/user.entity';
import { UserPaymentService } from '@/module/user/service/user-payment.service';
import { BookingService } from './booking.service';

@Injectable()
export class SupplierBookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        private readonly userPaymentService: UserPaymentService,
        private readonly bookingService: BookingService, // Use existing logic where possible
    ) {}

    private toSummaryDTO(b: BookingEntity): BookingSummaryDTO {
        // Reuse logic from BookingService or duplicate helper
        // Ideally BookingService should expose this public or we duplicate to keep independent
        return new BookingSummaryDTO({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            total_amount: Number(b.total_amount),
            status: b.status,
            payment_status: b.payment_status,
            user_id: b.user?.id,
            currency_id: b.currency?.id,
            currency: b.currency?.symbol,
            booking_payment_id: b.booking_payment?.id,
            booking_payment: b.booking_payment
                ? {
                      id: b.booking_payment.id,
                      payment_method_name:
                          b.booking_payment.payment_method_name,
                  }
                : undefined,
            created_at: b.created_at,
            updated_at: b.updated_at,
            booking_items: (b.booking_items ?? []).map(
                (item) =>
                    new BookingItemDetailDTO({
                        id: item.id,
                        total_amount: Number(item.total_amount),
                        unit_price: Number(item.unit_price),
                        quantity: item.quantity,
                        variant_id: item.variant?.id,
                        pax_type_id: item.pax_type?.id,
                        tour_session_id: item.tour_session?.id,
                        tour_title: item.variant?.tour?.title,
                        session_date: item.tour_session?.session_date,
                    } as Partial<BookingItemDetailDTO>),
            ),
        });
    }

    async getSupplierBookings(user: UserEntity): Promise<BookingSummaryDTO[]> {
        // Find bookings that contain items belonging to tours owned by this supplier (user)
        const bookings = await this.bookingRepository.find({
            where: {
                booking_items: {
                    variant: {
                        tour: {
                            supplier: {
                                users: { id: user.id },
                            },
                        },
                    },
                },
            },
            relations: [
                'user',
                'currency',
                'booking_payment',
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.supplier',
                'booking_items.variant.tour.supplier.users',
                'booking_items.tour_session',
            ],
            order: { created_at: 'DESC' },
        });

        return bookings.map((b) => this.toSummaryDTO(b));
    }

    async confirmBooking(
        id: number,
        user: UserEntity,
    ): Promise<BookingSummaryDTO> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.supplier',
                'booking_items.variant.tour.supplier.users',
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // Verify ownership
        const isOwner = booking.booking_items.some((item) =>
            item.variant?.tour?.supplier?.users?.some((u) => u.id === user.id),
        );
        if (!isOwner)
            throw new ForbiddenException('You do not own this booking');

        if (booking.status !== BookingStatus.waiting_supplier) {
            throw new BadRequestException(
                'Booking is not in waiting_supplier status',
            );
        }

        booking.status = BookingStatus.confirmed;
        // Payment is already PAID from user flow
        await this.bookingRepository.save(booking);

        return this.toSummaryDTO(booking);
    }

    async rejectBooking(
        id: number,
        user: UserEntity,
        reason: string,
    ): Promise<BookingSummaryDTO> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'currency',
                'payment_information',
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.supplier',
                'booking_items.variant.tour.supplier.users',
                'booking_items.tour_session',
                'booking_items.variant.tour_policy',
                'booking_items.variant.tour_policy.tour_policy_rules',
                'tour_inventory_hold', // Need this to release hold
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // Verify ownership
        const isOwner = booking.booking_items.some((item) =>
            item.variant?.tour?.supplier?.users?.some((u) => u.id === user.id),
        );
        if (!isOwner)
            throw new ForbiddenException('You do not own this booking');

        if (booking.status !== BookingStatus.waiting_supplier) {
            throw new BadRequestException(
                'Only waiting_supplier bookings can be rejected by supplier. Confirmed bookings requires Admin intervention.',
            );
        }

        // FULL REFUND logic for Supplier Reject
        const refundAmount = Number(booking.total_amount);
        const stripeChargeId = booking.payment_information?.stripe_charge_id;

        if (refundAmount > 0 && stripeChargeId) {
            await this.userPaymentService.refundCharge(
                stripeChargeId,
                refundAmount,
                booking.currency.symbol,
            );
            booking.payment_status = PaymentStatus.refunded;
            booking.refund_amount = refundAmount;
        }

        booking.status = BookingStatus.cancelled;
        booking.cancel_reason = reason || 'Rejected by Supplier';

        // Release inventory hold
        if (booking.tour_inventory_hold) {
            // Assuming we just expire it or clear it
            // Using logic similar to service
            await this.bookingRepository.manager
                .getRepository('tour_inventory_hold')
                .update(
                    { id: booking.tour_inventory_hold.id },
                    { expires_at: new Date(0) },
                );
        }

        await this.bookingRepository.save(booking);

        return this.toSummaryDTO(booking);
    }
}

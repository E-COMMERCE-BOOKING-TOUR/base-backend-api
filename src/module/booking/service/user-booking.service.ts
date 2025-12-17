import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { BookingPaymentEntity } from '../entity/bookingPayment.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import {
    UserBookingDetailDTO,
    ConfirmBookingDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { UpdateBookingContactDto } from '../dto/update-booking-contact.dto';
import { UpdateBookingPaymentDto } from '../dto/update-booking-payment.dto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class UserBookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(BookingPaymentEntity)
        private readonly bookingPaymentRepository: Repository<BookingPaymentEntity>,
        private readonly purchaseService: PurchaseService,
    ) { }

    async createBooking(uuid: string, dto: CreateBookingDto) {
        const { startDate, pax, variantId } = dto;

        const ctx = await this.purchaseService.execute({
            userUuid: uuid,
            variantId: variantId!,
            startDate,
            pax,
            meta: {},
        });

        if (!ctx.booking) {
            throw new Error('Failed to create booking');
        }

        // Set initial status to pending_info using update to avoid cascade issues
        await this.bookingRepository.update(
            { id: ctx.booking.id },
            { status: BookingStatus.pending_info }
        );

        // Reload booking with updated status
        const updatedBooking = await this.bookingRepository.findOne({
            where: { id: ctx.booking.id },
        });

        return updatedBooking || ctx.booking;
    }

    /**
     * Get current active booking for user (status = pending, pending_info, pending_payment, or pending_confirm)
     */
    async getCurrentBooking(userUuid: string): Promise<UserBookingDetailDTO> {
        const booking = await this.bookingRepository.findOne({
            where: [
                { user: { uuid: userUuid }, status: BookingStatus.pending },
                { user: { uuid: userUuid }, status: BookingStatus.pending_info },
                { user: { uuid: userUuid }, status: BookingStatus.pending_payment },
                { user: { uuid: userUuid }, status: BookingStatus.pending_confirm },
            ],
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.images',
                'booking_items.variant.tour.division',
                'booking_items.variant.tour.country',
                'booking_items.tour_session',
                'booking_items.pax_type',
                'currency',
                'payment_information',
                'booking_payment',
                'tour_inventory_hold',
            ],
            order: {
                id: 'DESC', // Get most recent pending booking
            },
        });

        if (!booking) {
            throw new NotFoundException('No active booking found');
        }

        return this.formatBookingDetail(booking);
    }

    async getBookingDetail(id: number, user: UserEntity): Promise<UserBookingDetailDTO> {
        const booking = await this.bookingRepository.findOne({
            where: { id, user: { uuid: user.uuid } },
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.images',
                'booking_items.variant.tour.division',
                'booking_items.variant.tour.country',
                'booking_items.tour_session',
                'booking_items.pax_type',
                'currency',
                'payment_information',
                'booking_payment',
                'tour_inventory_hold',
            ],
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        return this.formatBookingDetail(booking);
    }

    private formatBookingDetail(booking: BookingEntity): UserBookingDetailDTO {
        const firstItem = booking.booking_items[0];
        const tour = firstItem?.variant?.tour;
        const session = firstItem?.tour_session;

        return {
            id: booking.id,
            contact_name: booking.contact_name,
            contact_email: booking.contact_email,
            contact_phone: booking.contact_phone,
            total_amount: booking.total_amount,
            status: booking.status,
            payment_status: booking.payment_status,
            currency: booking.currency?.symbol || 'NaN',
            tour_title: tour?.title || '',
            tour_image: tour?.images?.[0]?.image_url || '',
            tour_location:
                tour?.division && tour?.country
                    ? `${tour.division.name}, ${tour.country.name}`
                    : '',
            start_date: session?.session_date,
            duration_days: tour?.duration_days || 0,
            duration_hours: tour?.duration_hours || 0,
            hold_expires_at: booking.tour_inventory_hold?.expires_at,
            items: booking.booking_items.map((item) => ({
                variant_id: item.variant.id,
                pax_type_id: item.pax_type.id,
                tour_session_id: item.tour_session.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount,
                pax_type_name: item.pax_type.name,
            })),
        };
    }

    /**
     * Update contact information for current booking
     */
    async updateBookingContact(userUuid: string, dto: UpdateBookingContactDto): Promise<any> {
        const booking = await this.bookingRepository.findOne({
            where: { user: { uuid: userUuid }, status: BookingStatus.pending_info },
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException('No active booking found for contact update');
        }

        // Use update to avoid cascade issues
        await this.bookingRepository.update(
            { id: booking.id },
            {
                contact_name: dto.contact_name,
                contact_email: dto.contact_email,
                contact_phone: dto.contact_phone,
                status: BookingStatus.pending_payment,
            }
        );

        return { success: true, bookingId: booking.id };
    }

    /**
     * Update payment method for current booking
     */
    async updateBookingPayment(userUuid: string, dto: UpdateBookingPaymentDto): Promise<any> {
        const booking = await this.bookingRepository.findOne({
            where: { user: { uuid: userUuid }, status: BookingStatus.pending_payment },
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException('No active booking found for payment update');
        }

        // Validate payment method exists and is active
        const paymentMethod = await this.bookingPaymentRepository.findOne({
            where: { id: dto.booking_payment_id, status: 'active' },
        });

        if (!paymentMethod) {
            throw new BadRequestException('Invalid payment method selected');
        }

        // Validate payment method eligibility based on total amount
        const totalAmount = Number(booking.total_amount);
        const ruleMin = Number(paymentMethod.rule_min) || 0;
        const ruleMax = Number(paymentMethod.rule_max) || Infinity;

        if (totalAmount < ruleMin || totalAmount > ruleMax) {
            throw new BadRequestException(
                `This payment method requires order amount between ${ruleMin} and ${ruleMax}`
            );
        }

        // Update booking with payment method
        await this.bookingRepository.update(
            { id: booking.id },
            {
                status: BookingStatus.pending_confirm,
                booking_payment: { id: dto.booking_payment_id }
            }
        );

        return { success: true, bookingId: booking.id };
    }

    /**
     * Confirm current booking
     */
    async confirmCurrentBooking(userUuid: string): Promise<any> {
        const booking = await this.bookingRepository.findOne({
            where: { user: { uuid: userUuid }, status: BookingStatus.pending_confirm },
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException('No booking ready for confirmation');
        }

        // Use update to avoid cascade issues
        await this.bookingRepository.update(
            { id: booking.id },
            {
                status: BookingStatus.confirmed,
                payment_status: PaymentStatus.paid,
            }
        );

        return { success: true, bookingId: booking.id };
    }

    async confirmBooking(dto: ConfirmBookingDTO): Promise<any> {
        const booking = await this.bookingRepository.findOne({
            where: { id: dto.booking_id },
        });
        if (!booking) {
            throw new NotFoundException(
                `Booking with ID ${dto.booking_id} not found`,
            );
        }

        booking.contact_name = dto.contact_name;
        booking.contact_email = dto.contact_email;
        booking.contact_phone = dto.contact_phone;
        // Update payment method if needed, for now assume it's just confirmation
        booking.status = BookingStatus.confirmed;
        booking.payment_status = PaymentStatus.paid; // Simulating successful payment

        return await this.bookingRepository.save(booking);
    }

    /**
     * Get all active payment methods
     */
    async getPaymentMethods() {
        const paymentMethods = await this.bookingPaymentRepository.find({
            where: { status: 'active' },
            relations: ['currency'],
            order: { id: 'ASC' },
        });

        return paymentMethods.map((method) => ({
            id: method.id,
            payment_method_name: method.payment_method_name,
            rule_min: method.rule_min,
            rule_max: method.rule_max,
            currency: method.currency?.symbol || '',
        }));
    }
}

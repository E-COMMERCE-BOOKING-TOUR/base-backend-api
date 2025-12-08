import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import {
    UserBookingDetailDTO,
    ConfirmBookingDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class UserBookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        private readonly purchaseService: PurchaseService,
    ) {}

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

        return ctx.booking;
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
}

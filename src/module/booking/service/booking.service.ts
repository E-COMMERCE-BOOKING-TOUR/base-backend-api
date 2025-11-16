import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { Repository } from 'typeorm';
type BookingItemDetail = {
    id: number;
    total_amount: number;
    unit_price: number;
    quantity: number;
    variant_id: number | undefined;
    pax_type_id: number | undefined;
    tour_session_id: number | undefined;
};

type BookingSummary = {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    total_amount: number;
    status: string;
    payment_status: string;
    user_id: number | undefined;
    currency_id: number | undefined;
    booking_payment_id: number | undefined;
};

type BookingDetail = BookingSummary & {
    payment_information_id: number | undefined;
    tour_inventory_hold_id: number | undefined;
    booking_items: BookingItemDetail[];
};

export class BookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private bookingRepository: Repository<BookingEntity>,
    ) {}

    async getAllBooking(): Promise<BookingSummary[]> {
        try {
            const bookings = await this.bookingRepository.find({
                relations: ['user', 'currency', 'booking_payment'],
                order: { created_at: 'DESC' as any },
            });

            return bookings.map((b) => ({
                id: b.id,
                contact_name: b.contact_name,
                contact_email: b.contact_email,
                contact_phone: b.contact_phone,
                total_amount: Number(b.total_amount),
                status: b.status,
                payment_status: b.payment_status,
                user_id: b.user?.id,
                currency_id: b.currency?.id,
                booking_payment_id: b.booking_payment?.id,
            }));
        } catch (error: any) {
            throw new Error('Fail getAllBooking: ' + (error?.message ?? ''));
        }
    }

    async getBookingById(id: number): Promise<BookingDetail | null> {
        try {
            const b = await this.bookingRepository.findOne({
                where: { id },
                relations: [
                    'user',
                    'currency',
                    'payment_information',
                    'tour_inventory_hold',
                    'booking_payment',
                    'booking_items',
                    'booking_items.variant',
                    'booking_items.pax_type',
                    'booking_items.tour_session',
                ],
            });
            if (!b) return null;

            return {
                id: b.id,
                contact_name: b.contact_name,
                contact_email: b.contact_email,
                contact_phone: b.contact_phone,
                total_amount: Number(b.total_amount),
                status: b.status,
                payment_status: b.payment_status,
                user_id: b.user?.id,
                currency_id: b.currency?.id,
                booking_payment_id: b.booking_payment?.id,
                payment_information_id: b.payment_information?.id,
                tour_inventory_hold_id: b.tour_inventory_hold?.id,
                booking_items: (b.booking_items ?? []).map((item) => ({
                    id: item.id,
                    total_amount: Number(item.total_amount),
                    unit_price: Number(item.unit_price),
                    quantity: item.quantity,
                    variant_id: item.variant?.id,
                    pax_type_id: item.pax_type?.id,
                    tour_session_id: item.tour_session?.id,
                })),
            };
        } catch (error: any) {
            throw new Error('Fail getBookingById: ' + (error?.message ?? ''));
        }
    }

    async getBookingsByUser(userId: number): Promise<BookingSummary[]> {
        try {
            const bookings = await this.bookingRepository.find({
                where: { user: { id: userId } },
                relations: ['user', 'currency', 'booking_payment'],
                order: { created_at: 'DESC' as any },
            });
            return bookings.map((b) => ({
                id: b.id,
                contact_name: b.contact_name,
                contact_email: b.contact_email,
                contact_phone: b.contact_phone,
                total_amount: Number(b.total_amount),
                status: b.status,
                payment_status: b.payment_status,
                user_id: b.user?.id,
                currency_id: b.currency?.id,
                booking_payment_id: b.booking_payment?.id,
            }));
        } catch (error: any) {
            throw new Error(
                'Fail getBookingsByUser: ' + (error?.message ?? ''),
            );
        }
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { BookingEntity } from '@/module/booking/entity/booking.entity';

export interface ChatContext {
    tourId?: number;
    tourSlug?: string;
    tourTitle?: string;
    bookingId?: number;
    supplierId?: number;
    supplierName?: string;
    source: 'tour_page' | 'booking' | 'general';
}

export interface RecentBookingInfo {
    id: number;
    tourId: number;
    tourTitle: string;
    tourSlug: string;
    supplierId?: number;
    supplierName?: string;
    startDate?: Date;
    status: string;
}

@Injectable()
export class ChatRoutingService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
    ) { }

    /**
     * Lookup supplier by tour ID
     */
    async getContextByTourId(tourId: number): Promise<ChatContext | null> {
        const tour = await this.tourRepository.findOne({
            where: { id: tourId },
            relations: ['supplier'],
        });

        if (!tour) return null;

        return {
            tourId: tour.id,
            tourSlug: tour.slug,
            tourTitle: tour.title,
            supplierId: tour.supplier?.id,
            supplierName: tour.supplier?.name,
            source: 'tour_page',
        };
    }

    /**
     * Lookup supplier by tour slug
     */
    async getContextByTourSlug(slug: string): Promise<ChatContext | null> {
        const tour = await this.tourRepository.findOne({
            where: { slug },
            relations: ['supplier'],
        });

        if (!tour) return null;

        return {
            tourId: tour.id,
            tourSlug: tour.slug,
            tourTitle: tour.title,
            supplierId: tour.supplier?.id,
            supplierName: tour.supplier?.name,
            source: 'tour_page',
        };
    }

    /**
     * Lookup supplier by booking ID
     * Booking -> tour_inventory_hold -> tour_session -> tour_variant -> tour -> supplier
     */
    async getContextByBookingId(bookingId: number): Promise<ChatContext | null> {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: [
                'tour_inventory_hold',
                'tour_inventory_hold.tour_session',
                'tour_inventory_hold.tour_session.tour_variant',
                'tour_inventory_hold.tour_session.tour_variant.tour',
                'tour_inventory_hold.tour_session.tour_variant.tour.supplier',
            ],
        });

        if (!booking) return null;

        const tour = booking.tour_inventory_hold?.tour_session?.tour_variant?.tour;
        if (!tour) return null;

        return {
            bookingId: booking.id,
            tourId: tour.id,
            tourSlug: tour.slug,
            tourTitle: tour.title,
            supplierId: tour.supplier?.id,
            supplierName: tour.supplier?.name,
            source: 'booking',
        };
    }

    /**
     * Get user's recent bookings (within 30 days)
     */
    async getUserRecentBookings(userId: number): Promise<RecentBookingInfo[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const bookings = await this.bookingRepository.find({
            where: {
                user: { id: userId },
                created_at: MoreThan(thirtyDaysAgo),
            },
            relations: [
                'tour_inventory_hold',
                'tour_inventory_hold.tour_session',
                'tour_inventory_hold.tour_session.tour_variant',
                'tour_inventory_hold.tour_session.tour_variant.tour',
                'tour_inventory_hold.tour_session.tour_variant.tour.supplier',
            ],
            order: { created_at: 'DESC' },
            take: 10,
        });

        const result: RecentBookingInfo[] = [];
        for (const b of bookings) {
            const tour = b.tour_inventory_hold?.tour_session?.tour_variant?.tour;
            if (!tour) continue;
            result.push({
                id: b.id,
                tourId: tour.id,
                tourTitle: tour.title,
                tourSlug: tour.slug,
                supplierId: tour.supplier?.id,
                supplierName: tour.supplier?.name,
                startDate: b.tour_inventory_hold?.tour_session?.session_date,
                status: b.status,
            });
        }
        return result;
    }

    /**
     * Build chat context from various sources
     */
    async buildContext(params: {
        tourId?: number;
        tourSlug?: string;
        bookingId?: number;
    }): Promise<ChatContext> {
        // Priority 1: Booking ID
        if (params.bookingId) {
            const context = await this.getContextByBookingId(params.bookingId);
            if (context) return context;
        }

        // Priority 2: Tour ID
        if (params.tourId) {
            const context = await this.getContextByTourId(params.tourId);
            if (context) return context;
        }

        // Priority 3: Tour Slug
        if (params.tourSlug) {
            const context = await this.getContextByTourSlug(params.tourSlug);
            if (context) return context;
        }

        // Fallback: General context
        return { source: 'general' };
    }
}

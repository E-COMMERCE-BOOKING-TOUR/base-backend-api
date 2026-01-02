import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../booking/entity/booking.entity';
import { TourEntity } from '../../tour/entity/tour.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { BookingItemEntity } from '../../booking/entity/bookingItem.entity';
import { BookingStatus, PaymentStatus } from '../../booking/dto/booking.dto';
import { TourStatus } from '../../tour/dto/tour.dto';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(BookingItemEntity)
        private readonly bookingItemRepository: Repository<BookingItemEntity>,
    ) { }

    async getStats(user: UserEntity) {
        const isAdmin = user.role?.name === 'admin';
        const supplierId = user.supplier?.id;

        const now = new Date();
        const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic Counts
        let totalBookingsQuery = this.bookingRepository.createQueryBuilder('booking');
        if (!isAdmin && supplierId) {
            totalBookingsQuery = totalBookingsQuery
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .where('tour.supplier_id = :supplierId', { supplierId });
        }
        const totalBookings = await totalBookingsQuery.getCount();

        const activeToursWhere: any = { status: TourStatus.active };
        if (!isAdmin && supplierId) {
            activeToursWhere.supplier = { id: supplierId };
        }
        const activeToursCount = await this.tourRepository.count({
            where: activeToursWhere,
        });

        // Suppliers shouldn't see total platform users
        const totalUsers = isAdmin ? await this.userRepository.count() : 0;

        // Revenue Calculations
        let confirmedBookingsQuery = this.bookingRepository.createQueryBuilder('booking')
            .where('(booking.status = :status OR booking.payment_status = :paymentStatus)', {
                status: BookingStatus.confirmed,
                paymentStatus: PaymentStatus.paid,
            })
            .select(['booking.total_amount', 'booking.created_at', 'booking.id']);

        if (!isAdmin && supplierId) {
            confirmedBookingsQuery = confirmedBookingsQuery
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        const confirmedBookings = await confirmedBookingsQuery.getMany();

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthlyRevenue = 0;

        confirmedBookings.forEach((b) => {
            const amount = Number(b.total_amount) || 0;
            totalRevenue += amount;
            if (b.created_at >= startOfDay) todayRevenue += amount;
            if (b.created_at >= startOfMonth) monthlyRevenue += amount;
        });

        // Chart Data (Last 6 Months)
        const chartData: { name: string; value: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('vi-VN', { month: 'short' });
            const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

            const monthRevenue = confirmedBookings
                .filter((b) => b.created_at >= d && b.created_at < nextMonth)
                .reduce((acc, cur) => acc + (Number(cur.total_amount) || 0), 0);

            chartData.push({ name: monthName, value: monthRevenue });
        }

        // Trending Tours (Top 5)
        let trendingQuery = this.bookingItemRepository.createQueryBuilder('item')
            .innerJoinAndSelect('item.variant', 'variant')
            .innerJoinAndSelect('variant.tour', 'tour')
            .innerJoin('item.booking', 'booking')
            .where('(booking.status = :status OR booking.payment_status = :paymentStatus)', {
                status: BookingStatus.confirmed,
                paymentStatus: PaymentStatus.paid,
            });

        if (!isAdmin && supplierId) {
            trendingQuery = trendingQuery.andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        const items = await trendingQuery.getMany();

        const tourMap: Record<
            number,
            { title: string; count: number; revenue: number }
        > = {};
        items.forEach((item) => {
            const tour = item.variant?.tour;
            if (!tour) return;
            if (!tourMap[tour.id]) {
                tourMap[tour.id] = { title: tour.title, count: 0, revenue: 0 };
            }
            tourMap[tour.id].count += item.quantity;
            tourMap[tour.id].revenue += Number(item.total_amount) || 0;
        });

        const trendingTours = Object.values(tourMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Recent Transactions
        let recentBookingsQuery = this.bookingRepository.createQueryBuilder('booking')
            .orderBy('booking.created_at', 'DESC')
            .take(10)
            .select([
                'booking.id',
                'booking.contact_name',
                'booking.contact_email',
                'booking.status',
                'booking.total_amount',
                'booking.created_at',
            ]);

        if (!isAdmin && supplierId) {
            recentBookingsQuery = recentBookingsQuery
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .where('tour.supplier_id = :supplierId', { supplierId });
        }

        const recentBookings = await recentBookingsQuery.getMany();

        return {
            kpis: {
                totalRevenue,
                todayRevenue,
                monthlyRevenue,
                totalBookings,
                activeToursCount,
                totalUsers,
            },
            chartData,
            trendingTours,
            recentBookings,
        };
    }
}

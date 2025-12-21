import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { BookingEntity } from '../../booking/entity/booking.entity';
import { TourEntity } from '../../tour/entity/tour.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { BookingItemEntity } from '../../booking/entity/bookingItem.entity';

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

    async getStats() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic Counts
        const totalBookings = await this.bookingRepository.count();
        const activeToursCount = await this.tourRepository.count({ where: { status: 'active' } });
        const totalUsers = await this.userRepository.count();

        // Revenue Calculations
        const confirmedBookings = await this.bookingRepository.find({
            where: [
                { status: 'confirmed' },
                { payment_status: 'paid' }
            ],
            select: ['total_amount', 'created_at']
        });

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthlyRevenue = 0;

        confirmedBookings.forEach(b => {
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
                .filter(b => b.created_at >= d && b.created_at < nextMonth)
                .reduce((acc, cur) => acc + (Number(cur.total_amount) || 0), 0);

            chartData.push({ name: monthName, value: monthRevenue });
        }

        // Trending Tours (Top 5)
        const items = await this.bookingItemRepository.find({
            relations: ['variant', 'variant.tour', 'booking'],
            where: {
                booking: [
                    { status: 'confirmed' },
                    { payment_status: 'paid' }
                ]
            }
        });

        const tourMap: Record<number, { title: string; count: number; revenue: number }> = {};
        items.forEach(item => {
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
        const recentBookings = await this.bookingRepository.find({
            order: { created_at: 'DESC' },
            take: 10,
            select: ['id', 'contact_name', 'contact_email', 'status', 'total_amount', 'created_at']
        });

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
            recentBookings
        };
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../booking/entity/booking.entity';
import { TourEntity } from '../../tour/entity/tour.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { BookingItemEntity } from '../../booking/entity/bookingItem.entity';
import { BookingStatus, PaymentStatus } from '../../booking/dto/booking.dto';
import { TourStatus } from '../../tour/dto/tour.dto';

export interface RevenuesByCurrency {
    [currencyCode: string]: {
        symbol: string;
        todayRevenue: number;
        monthlyRevenue: number;
        totalRevenue: number;
    };
}

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

        // Revenue Calculations - Include currency relation
        let confirmedBookingsQuery = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.currency', 'currency')
            .where('(booking.status = :status OR booking.payment_status = :paymentStatus)', {
                status: BookingStatus.confirmed,
                paymentStatus: PaymentStatus.paid,
            })
            .select([
                'booking.total_amount',
                'booking.created_at',
                'booking.id',
                'currency.id',
                'currency.name',
                'currency.symbol',
            ]);

        if (!isAdmin && supplierId) {
            confirmedBookingsQuery = confirmedBookingsQuery
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        const confirmedBookings = await confirmedBookingsQuery.getMany();

        // Group revenues by currency
        const revenuesByCurrency: RevenuesByCurrency = {};
        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthlyRevenue = 0;

        confirmedBookings.forEach((b) => {
            const amount = Number(b.total_amount) || 0;
            const currencyCode = b.currency?.name || 'VND';
            const currencySymbol = b.currency?.symbol || '₫';

            // Initialize currency entry if not exists
            if (!revenuesByCurrency[currencyCode]) {
                revenuesByCurrency[currencyCode] = {
                    symbol: currencySymbol,
                    todayRevenue: 0,
                    monthlyRevenue: 0,
                    totalRevenue: 0,
                };
            }

            revenuesByCurrency[currencyCode].totalRevenue += amount;
            if (b.created_at >= startOfDay) {
                revenuesByCurrency[currencyCode].todayRevenue += amount;
            }
            if (b.created_at >= startOfMonth) {
                revenuesByCurrency[currencyCode].monthlyRevenue += amount;
            }

            // Legacy totals (for backward compatibility)
            totalRevenue += amount;
            if (b.created_at >= startOfDay) todayRevenue += amount;
            if (b.created_at >= startOfMonth) monthlyRevenue += amount;
        });

        // Chart Data (Last 6 Months) - Group by currency
        const chartData: { name: string; value: number;[key: string]: unknown }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('vi-VN', { month: 'short' });
            const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

            const monthBookings = confirmedBookings.filter(
                (b) => b.created_at >= d && b.created_at < nextMonth
            );

            // Total revenue for chart (legacy)
            const monthRevenue = monthBookings.reduce(
                (acc, cur) => acc + (Number(cur.total_amount) || 0),
                0
            );

            // Revenue by currency for this month
            const monthRevenuesByCurrency: { [key: string]: number } = {};
            monthBookings.forEach((b) => {
                const currencyCode = b.currency?.name || 'VND';
                monthRevenuesByCurrency[currencyCode] =
                    (monthRevenuesByCurrency[currencyCode] || 0) +
                    (Number(b.total_amount) || 0);
            });

            chartData.push({
                name: monthName,
                value: monthRevenue,
                ...monthRevenuesByCurrency,
            });
        }

        // Trending Tours (Top 5) - Include currency info
        let trendingQuery = this.bookingItemRepository.createQueryBuilder('item')
            .innerJoinAndSelect('item.variant', 'variant')
            .innerJoinAndSelect('variant.tour', 'tour')
            .leftJoinAndSelect('tour.currency', 'tourCurrency')
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
            { title: string; count: number; revenue: number; currency_code: string; currency_symbol: string }
        > = {};
        items.forEach((item) => {
            const tour = item.variant?.tour;
            if (!tour) return;
            if (!tourMap[tour.id]) {
                tourMap[tour.id] = {
                    title: tour.title,
                    count: 0,
                    revenue: 0,
                    currency_code: tour.currency?.name || 'VND',
                    currency_symbol: tour.currency?.symbol || '₫',
                };
            }
            tourMap[tour.id].count += item.quantity;
            tourMap[tour.id].revenue += Number(item.total_amount) || 0;
        });

        const trendingTours = Object.values(tourMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Recent Transactions - Include currency info
        let recentBookingsQuery = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.currency', 'currency')
            .orderBy('booking.created_at', 'DESC')
            .take(10)
            .select([
                'booking.id',
                'booking.contact_name',
                'booking.contact_email',
                'booking.status',
                'booking.total_amount',
                'booking.created_at',
                'currency.id',
                'currency.name',
                'currency.symbol',
            ]);

        if (!isAdmin && supplierId) {
            recentBookingsQuery = recentBookingsQuery
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .where('tour.supplier_id = :supplierId', { supplierId });
        }

        const recentBookingsRaw = await recentBookingsQuery.getMany();
        const recentBookings = recentBookingsRaw.map((b) => ({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            status: b.status,
            total_amount: b.total_amount,
            created_at: b.created_at,
            currency_code: b.currency?.name || 'VND',
            currency_symbol: b.currency?.symbol || '₫',
        }));

        return {
            kpis: {
                totalRevenue,
                todayRevenue,
                monthlyRevenue,
                totalBookings,
                activeToursCount,
                totalUsers,
                revenuesByCurrency,
            },
            chartData,
            trendingTours,
            recentBookings,
        };
    }

    async getBookingsForExport(
        user: UserEntity,
        startDate?: string,
        endDate?: string,
        status?: string,
    ) {
        const isAdmin = user.role?.name === 'admin';
        const supplierId = user.supplier?.id;

        let query = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.currency', 'currency')
            .leftJoinAndSelect('booking.booking_items', 'items')
            .leftJoinAndSelect('items.variant', 'variant')
            .leftJoinAndSelect('variant.tour', 'tour')
            .orderBy('booking.created_at', 'DESC');

        if (!isAdmin && supplierId) {
            query = query.andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        if (startDate) {
            query = query.andWhere('booking.created_at >= :startDate', { startDate: new Date(startDate) });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query = query.andWhere('booking.created_at <= :endDate', { endDate: end });
        }

        if (status) {
            query = query.andWhere('booking.status = :status', { status });
        }

        const bookings = await query.getMany();

        return bookings.map(b => ({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            status: b.status,
            payment_status: b.payment_status,
            total_amount: b.total_amount,
            currency_code: b.currency?.name || 'VND',
            currency_symbol: b.currency?.symbol || '₫',
            created_at: b.created_at,
            items: b.booking_items?.map(item => ({
                tour_title: item.variant?.tour?.title,
                variant_name: item.variant?.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount,
            })),
        }));
    }

    async getToursForExport(
        user: UserEntity,
        status?: string,
    ) {
        const isAdmin = user.role?.name === 'admin';
        const supplierId = user.supplier?.id;

        let query = this.tourRepository.createQueryBuilder('tour')
            .leftJoinAndSelect('tour.currency', 'currency')
            .leftJoinAndSelect('tour.supplier', 'supplier')
            .leftJoinAndSelect('tour.variants', 'variants')
            .orderBy('tour.created_at', 'DESC');

        if (!isAdmin && supplierId) {
            query = query.andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        if (status) {
            query = query.andWhere('tour.status = :status', { status });
        }

        const tours = await query.getMany();

        return tours.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            duration_days: t.duration_days,
            duration_hours: t.duration_hours,
            address: t.address,
            cached_min_price: t.cached_min_price,
            cached_max_price: t.cached_max_price,
            currency_code: t.currency?.name || 'VND',
            currency_symbol: t.currency?.symbol || '₫',
            supplier_name: t.supplier?.name,
            variants_count: t.variants?.length || 0,
            created_at: t.created_at,
        }));
    }

    async getRevenueForExport(
        user: UserEntity,
        startDate?: string,
        endDate?: string,
    ) {
        const isAdmin = user.role?.name === 'admin';
        const supplierId = user.supplier?.id;

        let query = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.currency', 'currency')
            .where('(booking.status = :status OR booking.payment_status = :paymentStatus)', {
                status: BookingStatus.confirmed,
                paymentStatus: PaymentStatus.paid,
            });

        if (!isAdmin && supplierId) {
            query = query
                .innerJoin('booking.booking_items', 'item')
                .innerJoin('item.variant', 'variant')
                .innerJoin('variant.tour', 'tour')
                .andWhere('tour.supplier_id = :supplierId', { supplierId });
        }

        if (startDate) {
            query = query.andWhere('booking.created_at >= :startDate', { startDate: new Date(startDate) });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query = query.andWhere('booking.created_at <= :endDate', { endDate: end });
        }

        const bookings = await query.getMany();

        // Group by date and currency
        const revenueByDate: Record<string, Record<string, { symbol: string; amount: number; count: number }>> = {};

        bookings.forEach(b => {
            const dateKey = b.created_at.toISOString().split('T')[0];
            const currencyCode = b.currency?.name || 'VND';
            const currencySymbol = b.currency?.symbol || '₫';

            if (!revenueByDate[dateKey]) {
                revenueByDate[dateKey] = {};
            }

            if (!revenueByDate[dateKey][currencyCode]) {
                revenueByDate[dateKey][currencyCode] = { symbol: currencySymbol, amount: 0, count: 0 };
            }

            revenueByDate[dateKey][currencyCode].amount += Number(b.total_amount) || 0;
            revenueByDate[dateKey][currencyCode].count += 1;
        });

        // Convert to array format
        const result: Array<{
            date: string;
            currency_code: string;
            currency_symbol: string;
            revenue: number;
            bookings_count: number;
        }> = [];

        Object.entries(revenueByDate).forEach(([date, currencies]) => {
            Object.entries(currencies).forEach(([code, data]) => {
                result.push({
                    date,
                    currency_code: code,
                    currency_symbol: data.symbol,
                    revenue: data.amount,
                    bookings_count: data.count,
                });
            });
        });

        return result.sort((a, b) => a.date.localeCompare(b.date));
    }
}

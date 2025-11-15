import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BookingEntity } from '@/module/booking/entity/booking.entity';
import { BookingItemEntity } from '@/module/booking/entity/bookingItem.entity';
import { BookingPassengerEntity } from '@/module/booking/entity/bookingPassenger.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { BookingPaymentEntity } from '@/module/booking/entity/bookingPayment.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';

export default class BookingSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const bookingRepository = dataSource.getRepository(BookingEntity);
        const bookingItemRepository = dataSource.getRepository(BookingItemEntity);
        const passengerRepository = dataSource.getRepository(BookingPassengerEntity);
        const inventoryHoldRepository = dataSource.getRepository(TourInventoryHoldEntity);
        const sessionRepository = dataSource.getRepository(TourSessionEntity);
        const variantRepository = dataSource.getRepository(TourVariantEntity);
        const paxTypeRepository = dataSource.getRepository(TourPaxTypeEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        const paymentInfoRepository = dataSource.getRepository(PaymentInfomationEntity);
        const bookingPaymentRepository = dataSource.getRepository(BookingPaymentEntity);
        const currencyRepository = dataSource.getRepository(CurrencyEntity);

        // Get data
        const customers = await userRepository.find({ 
            where: { role: { name: 'customer' } },
            take: 8,
        });

        const variants = await variantRepository.find({
            where: { status: 'active' },
            relations: ['tour', 'currency', 'tour_variant_pax_type_prices', 'tour_variant_pax_type_prices.pax_type'],
            take: 10,
        });

        const paxTypes = await paxTypeRepository.find();
        const adultPaxType = paxTypes.find(p => p.name === 'Adult');
        const childPaxType = paxTypes.find(p => p.name === 'Child');
        const youthPaxType = paxTypes.find(p => p.name === 'Youth');

        const paymentMethods = await bookingPaymentRepository.find({ where: { status: 'active' } });
        const vnd = await currencyRepository.findOne({ where: { symbol: 'VND' } });

        if (customers.length === 0 || variants.length === 0 || !adultPaxType || paymentMethods.length === 0 || !vnd) {
            console.log('⚠️ Required data not found, skipping booking seeder');
            return;
        }

        // Create 15 bookings with different statuses
        for (let i = 0; i < 15; i++) {
            const customer = customers[i % customers.length];
            const variant = variants[Math.floor(Math.random() * variants.length)];

            // Get a future session (next 7-30 days)
            const daysAhead = Math.floor(Math.random() * 23) + 7;
            const sessionDate = new Date();
            sessionDate.setDate(sessionDate.getDate() + daysAhead);
            sessionDate.setHours(0, 0, 0, 0);

            const session = await sessionRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    session_date: sessionDate,
                    status: 'open',
                },
            });

            if (!session) continue;

            // Get customer's payment information
            const paymentInfo = await paymentInfoRepository.findOne({
                where: { user: { id: customer.id }, is_default: true },
            });

            if (!paymentInfo) continue;

            // Determine booking status
            let bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'expired';
            let paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partial';
            
            if (i < 8) {
                bookingStatus = 'confirmed';
                paymentStatus = 'paid';
            } else if (i < 11) {
                bookingStatus = 'pending';
                paymentStatus = 'unpaid';
            } else if (i < 13) {
                bookingStatus = 'cancelled';
                paymentStatus = 'refunded';
            } else {
                bookingStatus = 'expired';
                paymentStatus = 'unpaid';
            }

            // Calculate booking details
            const numAdults = Math.floor(Math.random() * 3) + 2; // 2-4 adults
            const numChildren = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0; // 0-2 children
            const numYouth = Math.random() > 0.7 ? 1 : 0;

            const totalPax = numAdults + numChildren + numYouth;

            // Get prices
            const adultPrice = variant.tour_variant_pax_type_prices.find(p => p.pax_type.name === 'Adult')?.price || 1000000;
            const childPrice = variant.tour_variant_pax_type_prices.find(p => p.pax_type.name === 'Child')?.price || 500000;
            const youthPrice = variant.tour_variant_pax_type_prices.find(p => p.pax_type.name === 'Youth')?.price || 750000;

            const totalAmount = (numAdults * adultPrice) + (numChildren * childPrice) + (numYouth * youthPrice);

            // Create inventory hold
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            const inventoryHold = await inventoryHoldRepository.save(
                inventoryHoldRepository.create({
                    quantity: totalPax,
                    expires_at: bookingStatus === 'expired' ? new Date() : expiresAt,
                    tour_session: session,
                }),
            );

            // Create booking
            const booking = await bookingRepository.save(
                bookingRepository.create({
                    contact_name: customer.full_name,
                    contact_email: customer.email,
                    contact_phone: customer.phone || '0901234567',
                    total_amount: totalAmount,
                    status: bookingStatus,
                    payment_status: paymentStatus,
                    user: customer,
                    currency: variant.currency,
                    payment_information: paymentInfo,
                    tour_inventory_hold: inventoryHold,
                    booking_payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                }),
            );

            // Update inventory hold with booking
            inventoryHold.booking = booking;
            await inventoryHoldRepository.save(inventoryHold);

            // Create booking items for each pax type
            const bookingItems: BookingItemEntity[] = [];

            if (numAdults > 0 && adultPaxType) {
                const item = await bookingItemRepository.save(
                    bookingItemRepository.create({
                        total_amount: numAdults * adultPrice,
                        unit_price: adultPrice,
                        quantity: numAdults,
                        booking: booking,
                        variant: variant,
                        pax_type: adultPaxType,
                        tour_session: session,
                    }),
                );
                bookingItems.push(item);
            }

            if (numChildren > 0 && childPaxType) {
                const item = await bookingItemRepository.save(
                    bookingItemRepository.create({
                        total_amount: numChildren * childPrice,
                        unit_price: childPrice,
                        quantity: numChildren,
                        booking: booking,
                        variant: variant,
                        pax_type: childPaxType,
                        tour_session: session,
                    }),
                );
                bookingItems.push(item);
            }

            if (numYouth > 0 && youthPaxType) {
                const item = await bookingItemRepository.save(
                    bookingItemRepository.create({
                        total_amount: numYouth * youthPrice,
                        unit_price: youthPrice,
                        quantity: numYouth,
                        booking: booking,
                        variant: variant,
                        pax_type: youthPaxType,
                        tour_session: session,
                    }),
                );
                bookingItems.push(item);
            }

            // Create passengers for confirmed bookings
            if (bookingStatus === 'confirmed') {
                const passengerNames = [
                    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D',
                    'Hoàng Văn E', 'Đỗ Thị F', 'Vũ Văn G', 'Bùi Thị H',
                ];

                let passengerIndex = 0;

                for (const item of bookingItems) {
                    for (let p = 0; p < item.quantity; p++) {
                        const birthYear = item.pax_type.name === 'Adult' 
                            ? Math.floor(Math.random() * 40) + 25
                            : item.pax_type.name === 'Youth'
                            ? Math.floor(Math.random() * 6) + 12
                            : Math.floor(Math.random() * 8) + 3;

                        const birthdate = new Date();
                        birthdate.setFullYear(birthdate.getFullYear() - birthYear);

                        await passengerRepository.save(
                            passengerRepository.create({
                                full_name: passengerNames[passengerIndex % passengerNames.length],
                                birthdate: birthdate,
                                phone_number: p === 0 ? customer.phone : null,
                                booking_item: item,
                                pax_type: item.pax_type,
                            } as any),
                        );
                        passengerIndex++;
                    }
                }
            }
        }

        console.log('Booking seeded');
    }
}


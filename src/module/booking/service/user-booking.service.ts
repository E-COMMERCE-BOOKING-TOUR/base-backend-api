import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { BookingItemEntity } from '../entity/bookingItem.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { BookingPaymentEntity } from '../entity/bookingPayment.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourVariantPaxTypePriceEntity } from '@/module/tour/entity/tourVariantPaxTypePrice.entity';
import { UserTourService } from '@/module/tour/service/user-tour.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import {
    UserBookingDetailDTO,
    ConfirmBookingDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserBookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(BookingItemEntity)
        private readonly bookingItemRepository: Repository<BookingItemEntity>,
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
        @InjectRepository(CurrencyEntity)
        private readonly currencyRepository: Repository<CurrencyEntity>,
        @InjectRepository(PaymentInfomationEntity)
        private readonly paymentInfoRepository: Repository<PaymentInfomationEntity>,
        @InjectRepository(BookingPaymentEntity)
        private readonly bookingPaymentRepository: Repository<BookingPaymentEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(TourVariantEntity)
        private readonly variantRepository: Repository<TourVariantEntity>,
        @InjectRepository(TourPaxTypeEntity)
        private readonly paxTypeRepository: Repository<TourPaxTypeEntity>,
        @InjectRepository(TourSessionEntity)
        private readonly sessionRepository: Repository<TourSessionEntity>,
        @InjectRepository(TourVariantPaxTypePriceEntity)
        private readonly priceRepository: Repository<TourVariantPaxTypePriceEntity>,
        private readonly userTourService: UserTourService,
    ) { }

    async createBooking(uuid: string, dto: CreateBookingDto) {
        const { startDate, pax, variantId } = dto;

        // 1. Validate User
        const user = await this.userRepository.findOne({
            where: { uuid },
        });
        if (!user) throw new Error('User not found');

        // 2. Find Variant and Tour
        const variant = await this.variantRepository.findOne({
            where: { id: variantId },
            relations: ['tour', 'tour_sessions'],
        });
        if (!variant) throw new Error('Variant not found');

        // 3. Find or Create Session
        // For simplicity, assuming session exists or creating a dummy one if not found for the date
        // In real app, should check availability properly
        let session = variant.tour_sessions.find(
            (s) =>
                new Date(s.session_date).toISOString().split('T')[0] ===
                startDate,
        );
        if (!session) {
            // Create a new session if not exists (simplified logic)
            session = this.sessionRepository.create({
                session_date: new Date(startDate),
                tour_variant: variant,
                capacity: 100, // Default capacity
                status: 'active',
            });
            await this.sessionRepository.save(session);
        }

        // 4. Create Inventory Hold
        const hold = this.inventoryHoldRepository.create({
            tour_session: session,
            quantity: pax.reduce((sum, p) => sum + p.quantity, 0),
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 mins hold
        });
        await this.inventoryHoldRepository.save(hold);

        // 5. Handle Payment Info & Booking Payment (Defaults for now)
        let paymentInfo = await this.paymentInfoRepository.findOne({
            where: { user: { id: user.id } },
        });
        if (!paymentInfo) {
            paymentInfo = this.paymentInfoRepository.create({
                user,
                is_default: true,
                expiry_date: '12/30',
                account_number: 'xxxx',
                account_number_hint: '1234',
                account_holder: user.full_name,
                ccv: 'xxx',
            });
            await this.paymentInfoRepository.save(paymentInfo);
        }

        let bookingPayment = await this.bookingPaymentRepository.findOne({
            where: { status: 'active' },
            relations: ['currency'],
        });
        if (!bookingPayment) {
            const currency =
                (await this.currencyRepository.findOne({
                    where: { name: 'VND' },
                })) ||
                (await this.currencyRepository.save(
                    this.currencyRepository.create({
                        name: 'VND',
                        symbol: 'đ',
                    }),
                ));
            bookingPayment = this.bookingPaymentRepository.create({
                payment_method_name: 'Credit Card',
                status: 'active',
                currency,
                rule_min: 0,
                rule_max: 1000000000,
            });
            await this.bookingPaymentRepository.save(bookingPayment);
        }

        // 6. Calculate Total Amount
        // Fetch tour with pricing rules
        const tour = (await this.variantRepository.manager
            .getRepository('TourEntity')
            .findOne({
                where: { id: variant.tour.id },
                relations: [
                    'variants',
                    'variants.tour_variant_pax_type_prices',
                    'variants.tour_variant_pax_type_prices.pax_type',
                    'variants.tour_price_rules',
                    'variants.tour_price_rules.tour_rule_pax_type_prices',
                    'variants.tour_price_rules.tour_rule_pax_type_prices.pax_type',
                ],
            })) as any; // Cast to any to avoid strict type checks if TourEntity is not fully compatible in this context

        const prices = this.userTourService.computeTourPricing(tour);

        let totalAmount = 0;
        const bookingItems: BookingItemEntity[] = [];

        for (const p of pax) {
            const priceInfo = prices.find((pr) => pr.paxTypeId === p.paxTypeId);
            const unitPrice = priceInfo?.finalPrice ?? 0;
            const amount = unitPrice * p.quantity;
            totalAmount += amount;

            const bookingItem = this.bookingItemRepository.create({
                variant,
                pax_type: { id: p.paxTypeId } as any,
                tour_session: session,
                quantity: p.quantity,
                unit_price: unitPrice,
                total_amount: amount,
            });
            bookingItems.push(bookingItem);
        }

        // 7. Create Booking
        const booking = this.bookingRepository.create({
            contact_name: user.full_name,
            contact_email: user.email,
            contact_phone: user.phone || '',
            total_amount: totalAmount,
            status: 'pending',
            payment_status: 'unpaid',
            user,
            currency: bookingPayment.currency,
            payment_information: paymentInfo,
            tour_inventory_hold: hold,
            booking_payment: bookingPayment,
            booking_items: bookingItems,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        for (const item of bookingItems) {
            item.booking = savedBooking;
            await this.bookingItemRepository.save(item);
        }

        hold.booking = savedBooking;
        await this.inventoryHoldRepository.save(hold);

        return savedBooking;
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

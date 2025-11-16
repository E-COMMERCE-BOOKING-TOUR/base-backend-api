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
import {
    BookingDTO,
    BookingItemDTO,
    BookingDetailDTO,
    BookingSummaryDTO,
    BookingStatus,
    PaymentStatus,
    BookingItemDetailDTO,
} from '../dto/booking.dto';

export class BookingService {
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
    ) {}

    private toSummaryDTO(b: BookingEntity): BookingSummaryDTO {
        return new BookingSummaryDTO({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            total_amount: Number(b.total_amount),
            status: b.status as any,
            payment_status: b.payment_status as any,
            user_id: b.user?.id,
            currency_id: b.currency?.id,
            booking_payment_id: b.booking_payment?.id,
        });
    }

    private toDetailDTO(b: BookingEntity): BookingDetailDTO {
        return new BookingDetailDTO({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            total_amount: Number(b.total_amount),
            status: b.status as any,
            payment_status: b.payment_status as any,
            user_id: b.user?.id,
            currency_id: b.currency?.id,
            booking_payment_id: b.booking_payment?.id,
            payment_information_id: b.payment_information?.id,
            tour_inventory_hold_id: b.tour_inventory_hold?.id,
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
                    }),
            ),
        });
    }

    async getAllBooking(): Promise<BookingSummaryDTO[]> {
        try {
            const bookings = await this.bookingRepository.find({
                relations: ['user', 'currency', 'booking_payment'],
                order: { created_at: 'DESC' as any },
            });

            return bookings.map((b) => this.toSummaryDTO(b));
        } catch (error: any) {
            throw new Error('Fail getAllBooking: ' + (error?.message ?? ''));
        }
    }

    async getBookingById(id: number): Promise<BookingDetailDTO | null> {
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
            return this.toDetailDTO(b);
        } catch (error: any) {
            throw new Error('Fail getBookingById: ' + (error?.message ?? ''));
        }
    }

    async getBookingsByUser(userId: number): Promise<BookingSummaryDTO[]> {
        try {
            const bookings = await this.bookingRepository.find({
                where: { user: { id: userId } },
                relations: ['user', 'currency', 'booking_payment'],
                order: { created_at: 'DESC' as any },
            });
            return bookings.map((b) => this.toSummaryDTO(b));
        } catch (error: any) {
            throw new Error(
                'Fail getBookingsByUser: ' + (error?.message ?? ''),
            );
        }
    }

    private async resolveRelations(dto: BookingDTO) {
        const user = await this.userRepository.findOne({
            where: { id: dto.user_id },
        });
        const currency = await this.currencyRepository.findOne({
            where: { id: dto.currency_id },
        });
        const paymentInfo = await this.paymentInfoRepository.findOne({
            where: { id: dto.payment_information_id },
        });
        const inventoryHold = await this.inventoryHoldRepository.findOne({
            where: { id: dto.tour_inventory_hold_id },
            relations: ['tour_session'],
        });
        const bookingPayment = await this.bookingPaymentRepository.findOne({
            where: { id: dto.booking_payment_id },
        });
        if (
            !user ||
            !currency ||
            !paymentInfo ||
            !inventoryHold ||
            !bookingPayment
        ) {
            throw new Error('Related entity not found');
        }
        return { user, currency, paymentInfo, inventoryHold, bookingPayment };
    }

    private async makeItemEntities(
        dtoItems: BookingItemDTO[],
        booking: BookingEntity,
    ) {
        const items: BookingItemEntity[] = [];
        for (const it of dtoItems) {
            const variant = await this.variantRepository.findOne({
                where: { id: it.variant_id },
                relations: ['tour_variant_pax_type_prices'],
            });
            const paxType = await this.paxTypeRepository.findOne({
                where: { id: it.pax_type_id },
            });
            const session = await this.sessionRepository.findOne({
                where: { id: it.tour_session_id },
                relations: ['tour_variant'],
            });
            if (!variant || !paxType || !session) {
                throw new Error('Item relation not found');
            }
            if (session.tour_variant?.id !== variant.id) {
                throw new Error('Session does not belong to variant');
            }
            let unitPrice = 0;
            const priceRow = await this.priceRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    pax_type: { id: paxType.id },
                },
                relations: [],
            });
            unitPrice = priceRow?.price ?? 0;
            const totalAmount = unitPrice * it.quantity;
            const entity = this.bookingItemRepository.create({
                booking,
                variant,
                pax_type: paxType,
                tour_session: session,
                unit_price: unitPrice,
                total_amount: totalAmount,
                quantity: it.quantity,
            });
            items.push(entity);
        }
        return items;
    }

    private sumItems(items: BookingItemEntity[]): number {
        return items.reduce((acc, cur) => acc + Number(cur.total_amount), 0);
    }

    async createBooking(dto: BookingDTO): Promise<BookingDetailDTO> {
        const { user, currency, paymentInfo, inventoryHold, bookingPayment } =
            await this.resolveRelations(dto);
        const booking = await this.bookingRepository.save(
            this.bookingRepository.create({
                contact_name: dto.contact_name,
                contact_email: dto.contact_email,
                contact_phone: dto.contact_phone,
                total_amount: 0,
                status: (dto.status ?? BookingStatus.pending) as any,
                payment_status: (dto.payment_status ??
                    PaymentStatus.unpaid) as any,
                user,
                currency,
                payment_information: paymentInfo,
                tour_inventory_hold: inventoryHold,
                booking_payment: bookingPayment,
            }),
        );
        const itemEntities = await this.makeItemEntities(
            dto.booking_items ?? [],
            booking,
        );
        await this.bookingItemRepository.save(itemEntities);
        booking.booking_items = itemEntities;
        booking.total_amount = this.sumItems(itemEntities);
        await this.bookingRepository.save(booking);
        inventoryHold.booking = booking;
        inventoryHold.quantity = itemEntities.reduce(
            (acc, cur) => acc + cur.quantity,
            0,
        );
        await this.inventoryHoldRepository.save(inventoryHold);
        const loaded = await this.bookingRepository.findOne({
            where: { id: booking.id },
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
        return this.toDetailDTO(loaded as BookingEntity);
    }

    async updateContact(
        id: number,
        payload: {
            contact_name?: string;
            contact_email?: string;
            contact_phone?: string;
        },
    ): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({
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
        if (!booking) return null;
        booking.contact_name = payload.contact_name ?? booking.contact_name;
        booking.contact_email = payload.contact_email ?? booking.contact_email;
        booking.contact_phone = payload.contact_phone ?? booking.contact_phone;
        await this.bookingRepository.save(booking);
        return this.toDetailDTO(booking);
    }

    async updateStatus(
        id: number,
        status: BookingStatus,
    ): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'user',
                'currency',
                'payment_information',
                'tour_inventory_hold',
                'booking_payment',
                'booking_items',
            ],
        });
        if (!booking) return null;
        booking.status = status as any;
        await this.bookingRepository.save(booking);
        return this.getBookingById(id);
    }

    async updatePaymentStatus(
        id: number,
        paymentStatus: PaymentStatus,
    ): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({ where: { id } });
        if (!booking) return null;
        booking.payment_status = paymentStatus as any;
        await this.bookingRepository.save(booking);
        return this.getBookingById(id);
    }

    async addItem(bookingId: number): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tour_inventory_hold'],
        });
        if (!booking) return null;
        const items = await this.bookingItemRepository.find({
            where: { booking: { id: bookingId } },
            relations: ['variant', 'pax_type', 'tour_session'],
        });
        booking.total_amount = this.sumItems(items);
        await this.bookingRepository.save(booking);
        if (booking.tour_inventory_hold) {
            booking.tour_inventory_hold.quantity = items.reduce(
                (acc, cur) => acc + cur.quantity,
                0,
            );
            await this.inventoryHoldRepository.save(
                booking.tour_inventory_hold,
            );
        }
        return this.getBookingById(bookingId);
    }

    async removeItem(itemId: number): Promise<BookingDetailDTO | null> {
        const item = await this.bookingItemRepository.findOne({
            where: { id: itemId },
            relations: ['booking', 'booking.tour_inventory_hold'],
        });
        if (!item) return null;
        const bookingId = item.booking.id;
        await this.bookingItemRepository.delete({ id: itemId });
        const items = await this.bookingItemRepository.find({
            where: { booking: { id: bookingId } },
        });
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tour_inventory_hold'],
        });
        if (booking) {
            booking.total_amount = this.sumItems(items);
            await this.bookingRepository.save(booking);
            if (booking.tour_inventory_hold) {
                booking.tour_inventory_hold.quantity = items.reduce(
                    (acc, cur) => acc + cur.quantity,
                    0,
                );
                await this.inventoryHoldRepository.save(
                    booking.tour_inventory_hold,
                );
            }
        }
        return this.getBookingById(bookingId);
    }

    async changeItemQuantity(
        itemId: number,
        quantity: number,
    ): Promise<BookingDetailDTO | null> {
        const item = await this.bookingItemRepository.findOne({
            where: { id: itemId },
            relations: ['booking'],
        });
        if (!item) return null;
        item.quantity = quantity;
        item.total_amount = Number(item.unit_price) * quantity;
        await this.bookingItemRepository.save(item);
        const bookingId = item.booking.id;
        const items = await this.bookingItemRepository.find({
            where: { booking: { id: bookingId } },
        });
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tour_inventory_hold'],
        });
        if (booking) {
            booking.total_amount = this.sumItems(items);
            await this.bookingRepository.save(booking);
            if (booking.tour_inventory_hold) {
                booking.tour_inventory_hold.quantity = items.reduce(
                    (acc, cur) => acc + cur.quantity,
                    0,
                );
                await this.inventoryHoldRepository.save(
                    booking.tour_inventory_hold,
                );
            }
        }
        return this.getBookingById(bookingId);
    }

    async removeBooking(id: number): Promise<boolean> {
        const res = await this.bookingRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async confirmBooking(id: number): Promise<BookingDetailDTO | null> {
        return this.updateStatus(id, BookingStatus.confirmed);
    }

    async cancelBooking(id: number): Promise<BookingDetailDTO | null> {
        return this.updateStatus(id, BookingStatus.cancelled);
    }

    async expireBooking(id: number): Promise<BookingDetailDTO | null> {
        return this.updateStatus(id, BookingStatus.expired);
    }
}

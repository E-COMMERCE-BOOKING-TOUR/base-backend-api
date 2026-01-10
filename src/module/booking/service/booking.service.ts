import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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
import { UserPaymentService } from '@/module/user/service/user-payment.service';

@Injectable()
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
        private readonly userPaymentService: UserPaymentService,
    ) { }

    private toSummaryDTO(b: BookingEntity): BookingSummaryDTO {
        return new BookingSummaryDTO({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            total_amount: Number(b.total_amount),
            status: b.status,
            payment_status: b.payment_status,
            user_id: b.user?.id,
            currency_id: b.currency?.id,
            currency: b.currency?.symbol,
            cancel_reason: b.cancel_reason,
            booking_payment_id: b.booking_payment?.id,
            booking_payment: b.booking_payment
                ? {
                    id: b.booking_payment.id,
                    payment_method_name:
                        b.booking_payment.payment_method_name,
                }
                : undefined,
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
                        tour_title: item.variant?.tour?.title,
                        session_date: item.tour_session?.session_date,
                        start_time: item.tour_session?.start_time?.toString(),
                        end_time: item.tour_session?.end_time?.toString(),
                    } as unknown as Partial<BookingItemDetailDTO>),
            ),
            created_at: b.created_at,
            updated_at: b.updated_at,
            deleted_at: b.deleted_at ?? undefined,
        } as unknown as Partial<BookingSummaryDTO>);
    }

    private toDetailDTO(b: BookingEntity): BookingDetailDTO {
        return new BookingDetailDTO({
            id: b.id,
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            total_amount: Number(b.total_amount),
            status: b.status,
            payment_status: b.payment_status,
            user_id: b.user?.id,
            currency_id: b.currency?.id,
            currency: b.currency?.symbol,
            cancel_reason: b.cancel_reason,
            booking_payment_id: b.booking_payment?.id,
            booking_payment: b.booking_payment
                ? {
                    id: b.booking_payment.id,
                    payment_method_name:
                        b.booking_payment.payment_method_name,
                }
                : undefined,
            payment_information: b.payment_information
                ? {
                    brand: b.payment_information.brand,
                    last4: b.payment_information.last4,
                    account_holder: b.payment_information.account_holder,
                }
                : undefined,
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
                        tour_title: item.variant?.tour?.title,
                        variant_name: item.variant?.name,
                        pax_type_name: item.pax_type?.name,
                        session_date: item.tour_session?.session_date,
                        start_time: item.tour_session?.start_time?.toString(),
                        end_time: item.tour_session?.end_time?.toString(),
                        booking_passengers: (item.booking_passengers ?? []).map(
                            (p) => ({
                                id: p.id,
                                full_name: p.full_name,
                                phone_number: p.phone_number,
                                birthdate: p.birthdate,
                                pax_type_name: item.pax_type?.name,
                            }),
                        ),
                    } as unknown as Partial<BookingItemDetailDTO>),
            ),
            created_at: b.created_at,
            updated_at: b.updated_at,
            deleted_at: b.deleted_at ?? undefined,
        } as unknown as Partial<BookingDetailDTO>);
    }

    async getAllBooking(user?: UserEntity): Promise<BookingSummaryDTO[]> {
        try {
            const queryBuilder = this.bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.user', 'booking_user')
                .leftJoinAndSelect('booking.currency', 'currency')
                .leftJoinAndSelect('booking.booking_payment', 'booking_payment')
                .leftJoinAndSelect(
                    'booking.payment_information',
                    'payment_information',
                )
                .leftJoinAndSelect(
                    'booking.tour_inventory_hold',
                    'tour_inventory_hold',
                )
                .leftJoinAndSelect('booking.booking_items', 'booking_items')
                .leftJoinAndSelect('booking_items.variant', 'variant')
                .leftJoinAndSelect('variant.tour', 'tour')
                .orderBy('booking.created_at', 'DESC');

            // Robust check for admin or superadmin role
            const roleName = user?.role?.name?.toLowerCase();
            const isAdmin = roleName === 'admin' || roleName === 'superadmin';

            // Non-admin users with a supplier ID only see bookings containing their own items
            if (!isAdmin && user?.supplier?.id) {
                queryBuilder.andWhere('tour.supplier_id = :supplierId', {
                    supplierId: user.supplier.id,
                });
            }

            const bookings = await queryBuilder.getMany();

            return bookings.map((b) => this.toSummaryDTO(b));
        } catch (error) {
            throw new Error(
                'Fail getAllBooking: ' +
                (error instanceof Error ? error.message : String(error)),
            );
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
                    'booking_items.variant.tour',
                    'booking_items.pax_type',
                    'booking_items.tour_session',
                    'booking_items.booking_passengers',
                ],
            });
            if (!b) return null;
            return this.toDetailDTO(b);
        } catch (error) {
            throw new Error(
                'Fail getBookingById: ' +
                (error instanceof Error ? error.message : String(error)),
            );
        }
    }

    async getBookingsByUser(userId: number): Promise<BookingSummaryDTO[]> {
        try {
            const bookings = await this.bookingRepository.find({
                where: { user: { id: userId } },
                relations: [
                    'user',
                    'currency',
                    'booking_payment',
                    'payment_information',
                    'tour_inventory_hold',
                    'booking_items',
                    'booking_items.variant',
                    'booking_items.variant.tour',
                ],
                order: { created_at: 'DESC' },
            });
            return bookings.map((b) => this.toSummaryDTO(b));
        } catch (error) {
            throw new Error(
                'Fail getBookingsByUser: ' +
                (error instanceof Error ? error.message : String(error)),
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
            const missing: string[] = [];
            if (!user) missing.push('user');
            if (!currency) missing.push('currency');
            if (!paymentInfo) missing.push('payment_information');
            if (!inventoryHold) missing.push('tour_inventory_hold');
            if (!bookingPayment) missing.push('booking_payment');
            throw new BadRequestException(
                `Missing related: ${missing.join(', ')}`,
            );
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
        return items.reduce(
            (acc, cur) => acc + Number(cur.total_amount ?? 0),
            0,
        );
    }

    async createBooking(dto: BookingDTO): Promise<BookingDetailDTO> {
        return await this.bookingRepository.manager.transaction(async (mgr) => {
            const bookingRepo = mgr.getRepository(BookingEntity);
            const bookingItemRepo = mgr.getRepository(BookingItemEntity);
            const userRepo = mgr.getRepository(UserEntity);
            const currencyRepo = mgr.getRepository(CurrencyEntity);
            const paymentInfoRepo = mgr.getRepository(PaymentInfomationEntity);
            const inventoryHoldRepo = mgr.getRepository(
                TourInventoryHoldEntity,
            );
            const bookingPaymentRepo = mgr.getRepository(BookingPaymentEntity);
            const variantRepo = mgr.getRepository(TourVariantEntity);
            const paxTypeRepo = mgr.getRepository(TourPaxTypeEntity);
            const sessionRepo = mgr.getRepository(TourSessionEntity);
            const priceRepo = mgr.getRepository(TourVariantPaxTypePriceEntity);

            const user = await userRepo.findOne({ where: { id: dto.user_id } });
            const currency = await currencyRepo.findOne({
                where: { id: dto.currency_id },
            });
            const paymentInfo = await paymentInfoRepo.findOne({
                where: { id: dto.payment_information_id },
            });
            const inventoryHold = await inventoryHoldRepo.findOne({
                where: { id: dto.tour_inventory_hold_id },
                relations: ['tour_session'],
            });
            let hold = inventoryHold;
            if (!hold) {
                const firstItem = dto.booking_items?.[0];
                if (!firstItem)
                    throw new BadRequestException(
                        'Missing related: tour_inventory_hold and booking_items',
                    );
                const baseSession = await sessionRepo.findOne({
                    where: { id: firstItem.tour_session_id },
                });
                if (!baseSession)
                    throw new BadRequestException(
                        'Missing item relations: tour_session',
                    );
                const totalQty = (dto.booking_items ?? []).reduce(
                    (acc, it) => acc + Number(it.quantity ?? 0),
                    0,
                );
                hold = await inventoryHoldRepo.save(
                    inventoryHoldRepo.create({
                        tour_session: baseSession,
                        quantity: totalQty,
                        expires_at: undefined,
                        booking: undefined,
                    }),
                );
            }
            const bookingPayment = await bookingPaymentRepo.findOne({
                where: { id: dto.booking_payment_id },
            });
            if (
                !user ||
                !currency ||
                !paymentInfo ||
                !hold ||
                !bookingPayment
            ) {
                const missing: string[] = [];
                if (!user) missing.push('user');
                if (!currency) missing.push('currency');
                if (!paymentInfo) missing.push('payment_information');
                if (!hold) missing.push('tour_inventory_hold');
                if (!bookingPayment) missing.push('booking_payment');
                throw new BadRequestException(
                    `Missing related: ${missing.join(', ')}`,
                );
            }

            const booking = await bookingRepo.save(
                bookingRepo.create({
                    contact_name: dto.contact_name,
                    contact_email: dto.contact_email,
                    contact_phone: dto.contact_phone,
                    total_amount: 0,
                    status: dto.status ?? BookingStatus.pending,
                    payment_status: dto.payment_status ?? PaymentStatus.unpaid,
                    user,
                    currency,
                    payment_information: paymentInfo,
                    tour_inventory_hold: hold,
                    booking_payment: bookingPayment,
                }),
            );

            const items: BookingItemEntity[] = [];
            for (const it of dto.booking_items ?? []) {
                const variant = await variantRepo.findOne({
                    where: { id: it.variant_id },
                    relations: ['tour_variant_pax_type_prices'],
                });
                const paxType = await paxTypeRepo.findOne({
                    where: { id: it.pax_type_id },
                });
                const session = await sessionRepo.findOne({
                    where: { id: it.tour_session_id },
                    relations: ['tour_variant'],
                });
                if (!variant || !paxType || !session) {
                    const missing: string[] = [];
                    if (!variant) missing.push('variant');
                    if (!paxType) missing.push('pax_type');
                    if (!session) missing.push('tour_session');
                    throw new BadRequestException(
                        `Missing item relations: ${missing.join(', ')}`,
                    );
                }
                if (session.tour_variant?.id !== variant.id)
                    throw new BadRequestException(
                        'Session does not belong to variant',
                    );
                const priceRow = await priceRepo.findOne({
                    where: {
                        tour_variant: { id: variant.id },
                        pax_type: { id: paxType.id },
                    },
                });
                const unitPrice = Number(priceRow?.price ?? 0);
                const qty = Number(it.quantity ?? 0);
                const entity = bookingItemRepo.create({
                    booking,
                    variant,
                    pax_type: paxType,
                    tour_session: session,
                    unit_price: unitPrice,
                    total_amount: unitPrice * qty,
                    quantity: qty,
                });
                items.push(entity);
            }
            await bookingItemRepo.save(items);

            booking.booking_items = items;
            booking.total_amount = this.sumItems(items);
            await bookingRepo.save(booking);

            hold.booking = booking;
            hold.quantity = items.reduce((acc, cur) => acc + cur.quantity, 0);
            await inventoryHoldRepo.save(hold);

            const loaded = await bookingRepo.findOne({
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
        });
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
                'booking_items.variant.tour',
                'booking_items.pax_type',
                'booking_items.tour_session',
                'booking_items.booking_passengers',
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
        booking.status = status;
        await this.bookingRepository.save(booking);
        return this.getBookingById(id);
    }

    async updatePaymentStatus(
        id: number,
        paymentStatus: PaymentStatus,
    ): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({ where: { id } });
        if (!booking) return null;
        booking.payment_status = paymentStatus;
        await this.bookingRepository.save(booking);
        return this.getBookingById(id);
    }

    async addItem(
        bookingId: number,
        item?: BookingItemDTO,
    ): Promise<BookingDetailDTO | null> {
        return await this.bookingRepository.manager.transaction(async (mgr) => {
            const bookingRepo = mgr.getRepository(BookingEntity);
            const bookingItemRepo = mgr.getRepository(BookingItemEntity);
            const inventoryHoldRepo = mgr.getRepository(
                TourInventoryHoldEntity,
            );
            const variantRepo = mgr.getRepository(TourVariantEntity);
            const paxTypeRepo = mgr.getRepository(TourPaxTypeEntity);
            const sessionRepo = mgr.getRepository(TourSessionEntity);
            const priceRepo = mgr.getRepository(TourVariantPaxTypePriceEntity);

            const booking = await bookingRepo.findOne({
                where: { id: bookingId },
                relations: ['tour_inventory_hold'],
            });
            if (!booking) return null;
            if (item) {
                const variant = await variantRepo.findOne({
                    where: { id: item.variant_id },
                    relations: ['tour_variant_pax_type_prices'],
                });
                const paxType = await paxTypeRepo.findOne({
                    where: { id: item.pax_type_id },
                });
                const session = await sessionRepo.findOne({
                    where: { id: item.tour_session_id },
                    relations: ['tour_variant'],
                });
                if (!variant || !paxType || !session) {
                    const missing: string[] = [];
                    if (!variant) missing.push('variant');
                    if (!paxType) missing.push('pax_type');
                    if (!session) missing.push('tour_session');
                    throw new BadRequestException(
                        `Missing item relations: ${missing.join(', ')}`,
                    );
                }
                if (session.tour_variant?.id !== variant.id)
                    throw new BadRequestException(
                        'Session does not belong to variant',
                    );
                const priceRow = await priceRepo.findOne({
                    where: {
                        tour_variant: { id: variant.id },
                        pax_type: { id: paxType.id },
                    },
                });
                const unitPrice = Number(priceRow?.price ?? 0);
                const qty = Number(item.quantity ?? 0);
                const entity = bookingItemRepo.create({
                    booking,
                    variant,
                    pax_type: paxType,
                    tour_session: session,
                    unit_price: unitPrice,
                    total_amount: unitPrice * qty,
                    quantity: qty,
                });
                await bookingItemRepo.save(entity);
            }
            const items = await bookingItemRepo.find({
                where: { booking: { id: bookingId } },
                relations: ['variant', 'pax_type', 'tour_session'],
            });
            booking.total_amount = this.sumItems(items);
            await bookingRepo.save(booking);
            if (booking.tour_inventory_hold) {
                booking.tour_inventory_hold.quantity = items.reduce(
                    (acc, cur) => acc + cur.quantity,
                    0,
                );
                await inventoryHoldRepo.save(booking.tour_inventory_hold);
            }
            return await this.getBookingById(bookingId);
        });
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
        const qty = Number(quantity ?? 0);
        if (!Number.isFinite(qty) || qty < 0)
            throw new BadRequestException('Invalid quantity');
        item.quantity = qty;
        item.total_amount = Number(item.unit_price ?? 0) * qty;
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

    async cancelBooking(
        id: number,
        reason?: string,
    ): Promise<BookingDetailDTO | null> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'currency',
                'payment_information',
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour_policy',
                'booking_items.variant.tour_policy.tour_policy_rules',
                'booking_items.tour_session',
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // Process refund if booking was confirmed/waiting_supplier and paid
        if (
            (booking.status === BookingStatus.confirmed ||
                booking.status === BookingStatus.waiting_supplier) &&
            booking.payment_status === PaymentStatus.paid
        ) {
            // Always calculate refund based on policy
            const result = await this.calculateRefund(id);
            const refundAmount = result.refundAmount;

            const stripeChargeId =
                booking.payment_information?.stripe_charge_id;

            if (refundAmount > 0 && stripeChargeId) {
                await this.userPaymentService.refundCharge(
                    stripeChargeId,
                    refundAmount,
                    booking.currency.symbol,
                );
                booking.payment_status = PaymentStatus.refunded;
                booking.refund_amount = refundAmount;
            }
        }

        // Save cancel reason
        if (reason) {
            booking.cancel_reason = reason;
        }
        booking.status = BookingStatus.cancelled;
        await this.bookingRepository.save(booking);

        return this.getBookingById(id);
    }

    async expireBooking(id: number): Promise<BookingDetailDTO | null> {
        return this.updateStatus(id, BookingStatus.expired);
    }

    /**
     * Calculate refund amount based on supplier policy (for admin)
     */
    async calculateRefund(bookingId: number): Promise<{
        refundAmount: number;
        feeAmount: number;
        feePct: number;
    }> {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour_policy',
                'booking_items.variant.tour_policy.tour_policy_rules',
                'booking_items.tour_session',
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // Get policy from first item
        const firstItem = booking.booking_items?.[0];
        const policy = firstItem?.variant?.tour_policy;
        const session = firstItem?.tour_session;

        if (!policy || !session) {
            // No policy = full refund
            return {
                refundAmount: Number(booking.total_amount),
                feeAmount: 0,
                feePct: 0,
            };
        }

        // Calculate hours until tour starts
        const tourStartDate = new Date(session.session_date);
        if (session.start_time) {
            const [h, m, s] = String(session.start_time).split(':').map(Number);
            tourStartDate.setHours(h || 0, m || 0, s || 0);
        }

        const now = new Date();
        const diffMs = tourStartDate.getTime() - now.getTime();
        const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

        // Find applicable rule
        const rules = (policy.tour_policy_rules || []).sort(
            (a, b) => b.before_hours - a.before_hours,
        );
        let applicableFeePct = 100;

        for (const rule of rules) {
            if (diffHours >= rule.before_hours) {
                applicableFeePct = rule.fee_pct;
                break;
            }
        }

        const feeAmount =
            (Number(booking.total_amount) * applicableFeePct) / 100;
        const refundAmount = Number(booking.total_amount) - feeAmount;

        return {
            refundAmount: Math.max(0, refundAmount),
            feeAmount,
            feePct: applicableFeePct,
        };
    }

    async processAdminRefund(id: number, amount?: number): Promise<any> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['currency', 'payment_information'],
        });

        if (!booking) throw new NotFoundException('Booking not found');

        const refundAmount = amount ?? Number(booking.total_amount);
        const stripeChargeId = booking.payment_information?.stripe_charge_id;

        if (refundAmount > 0 && stripeChargeId) {
            await this.userPaymentService.refundCharge(
                stripeChargeId,
                refundAmount,
                booking.currency.symbol,
            );
        }

        booking.payment_status = PaymentStatus.refunded;
        booking.refund_amount = (booking.refund_amount || 0) + refundAmount;
        await this.bookingRepository.save(booking);

        return { success: true, refundAmount };
    }
}

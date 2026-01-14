import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { BookingPaymentEntity } from '../entity/bookingPayment.entity';
import { BookingPassengerEntity } from '../entity/bookingPassenger.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import {
    UserBookingDetailDTO,
    ConfirmBookingDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { UpdateBookingContactDto } from '../dto/update-booking-contact.dto';
import { UpdateBookingPaymentDto } from '../dto/update-booking-payment.dto';
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import { PurchaseService } from '../purchase/purchase.service';
import { UserPaymentService } from '@/module/user/service/user-payment.service';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { PaymentCardID } from '../entity/bookingPayment.entity';
import PDFDocument from 'pdfkit';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from '@/module/user/processor/email.processor';
import { NotificationService } from '@/module/user/service/notification.service';
import { NotificationType, TargetGroup } from '@/module/user/dtos/notification.dto';

@Injectable()
export class UserBookingService {
    private readonly logger = new Logger(UserBookingService.name);

    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(BookingPaymentEntity)
        private readonly bookingPaymentRepository: Repository<BookingPaymentEntity>,
        @InjectRepository(BookingPassengerEntity)
        private readonly bookingPassengerRepository: Repository<BookingPassengerEntity>,
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
        @InjectRepository(PaymentInfomationEntity)
        private readonly paymentInfoRepository: Repository<PaymentInfomationEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly purchaseService: PurchaseService,
        private readonly userPaymentService: UserPaymentService,
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue,
        private readonly notificationService: NotificationService,
    ) { }

    async createBooking(
        uuid: string,
        dto: CreateBookingDto,
    ): Promise<BookingEntity> {
        const { startDate, pax, variantId, tourSessionId } = dto;

        const ctx = await this.purchaseService.execute({
            userUuid: uuid,
            variantId: variantId!,
            startDate,
            pax,
            tourSessionId,
            meta: {},
        });

        if (!ctx.booking) {
            throw new Error('Failed to create booking');
        }

        // Set initial status to pending_info using update to avoid cascade issues
        await this.bookingRepository.update(
            { id: ctx.booking.id },
            { status: BookingStatus.pending_info },
        );

        // Reload booking with updated status
        const updatedBooking = await this.bookingRepository.findOne({
            where: { id: ctx.booking.id },
        });

        return updatedBooking || ctx.booking;
    }

    /**
     * Get current active booking for user (status = pending, pending_info, pending_payment, or pending_confirm)
     */
    async getCurrentBooking(userUuid: string): Promise<UserBookingDetailDTO> {
        const booking = await this.bookingRepository.findOne({
            where: [
                { user: { uuid: userUuid }, status: BookingStatus.pending },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_info,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_payment,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_confirm,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.waiting_supplier,
                    updated_at: MoreThan(new Date(Date.now() - 5 * 60 * 1000)),
                },
            ],
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.images',
                'booking_items.variant.tour.division',
                'booking_items.variant.tour.country',
                'booking_items.variant.tour_policy',
                'booking_items.variant.tour_policy.tour_policy_rules',
                'booking_items.tour_session',
                'booking_items.pax_type',
                'currency',
                'payment_information',
                'booking_payment',
                'tour_inventory_hold',
                'booking_items.booking_passengers',
            ],
            order: {
                id: 'DESC', // Get most recent pending booking
            },
        });

        if (!booking) {
            throw new NotFoundException('No active booking found');
        }

        return this.formatBookingDetail(booking);
    }

    async getBookingDetail(
        id: number,
        user: UserEntity,
    ): Promise<UserBookingDetailDTO> {
        const booking = await this.bookingRepository.findOne({
            where: { id, user: { uuid: user.uuid } },
            relations: [
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.images',
                'booking_items.variant.tour.division',
                'booking_items.variant.tour.country',
                'booking_items.variant.tour_policy',
                'booking_items.variant.tour_policy.tour_policy_rules',
                'booking_items.tour_session',
                'booking_items.pax_type',
                'currency',
                'payment_information',
                'booking_payment',
                'tour_inventory_hold',
                'booking_items.booking_passengers',
            ],
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        return this.formatBookingDetail(booking);
    }

    private formatBookingDetail(booking: BookingEntity): UserBookingDetailDTO {
        const sortedItems = booking.booking_items.sort((a, b) => a.id - b.id);
        const firstItem = sortedItems[0];
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
            currency: booking.currency?.symbol || '',
            tour_id: tour?.id || 0,
            tour_title: tour?.title || '',
            tour_image: tour?.images?.[0]?.image_url || '',
            tour_location:
                tour?.division && tour?.country
                    ? `${tour.division.name}, ${tour.country.name}`
                    : '',
            start_date: session?.session_date,
            duration_days: tour?.duration_days || 0,
            duration_hours: tour?.duration_hours || 0,
            session_start_time:
                session?.start_time instanceof Date
                    ? session.start_time.toLocaleTimeString('en-GB', {
                        hour12: false,
                    })
                    : typeof session?.start_time === 'string'
                        ? session.start_time
                        : undefined,
            session_end_time:
                session?.end_time instanceof Date
                    ? session.end_time.toLocaleTimeString('en-GB', {
                        hour12: false,
                    })
                    : typeof session?.end_time === 'string'
                        ? session.end_time
                        : undefined,
            hold_expires_at: booking.tour_inventory_hold?.expires_at,
            items: sortedItems.map((item) => ({
                variant_id: item.variant.id,
                pax_type_id: item.pax_type.id,
                tour_session_id: item.tour_session.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount,
                pax_type_name: item.pax_type.name,
            })),
            passengers: sortedItems.flatMap((item) =>
                (item.booking_passengers || []).map((p) => ({
                    full_name: p.full_name,
                    phone_number: p.phone_number || '', // Ensure string
                    pax_type_name: item.pax_type.name,
                })),
            ),
            booking_payment: booking.booking_payment
                ? {
                    id: booking.booking_payment.id,
                    payment_method_name:
                        booking.booking_payment.payment_method_name,
                }
                : undefined,
            payment_information: booking.payment_information
                ? {
                    brand: booking.payment_information.brand || undefined,
                    last4: booking.payment_information.last4 || undefined,
                    expiry_date:
                        booking.payment_information.expiry_date || undefined,
                    account_holder:
                        booking.payment_information.account_holder ||
                        undefined,
                }
                : undefined,
            policy: firstItem?.variant?.tour_policy
                ? {
                    ...firstItem.variant.tour_policy,
                    supplier_id: firstItem.variant.tour_policy.supplier_id,
                    rules: firstItem.variant.tour_policy.tour_policy_rules,
                }
                : undefined,
            cancel_reason: booking.cancel_reason,
        };
    }

    /**
     * Update contact information for current booking
     */
    async updateBookingContact(
        userUuid: string,
        dto: UpdateBookingContactDto,
    ): Promise<{ success: boolean; bookingId: number }> {
        const booking = await this.bookingRepository.findOne({
            where: [
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_info,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_payment,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_confirm,
                },
            ],
            relations: [
                'tour_inventory_hold',
                'booking_items',
                'booking_items.pax_type',
            ],
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException(
                'No active booking found for contact update',
            );
        }

        // Check if booking hold has expired
        if (booking.tour_inventory_hold?.expires_at) {
            const expiresAt = new Date(booking.tour_inventory_hold.expires_at);
            if (expiresAt < new Date()) {
                throw new BadRequestException(
                    'Your booking hold has expired. Please start a new booking.',
                );
            }
        }

        // Use update to avoid cascade issues
        // Update passengers if provided
        if (dto.passengers && dto.passengers.length > 0) {
            // Validate total passengers
            const totalPassengers = booking.booking_items.reduce(
                (sum, item) => sum + item.quantity,
                0,
            );
            if (dto.passengers.length !== totalPassengers) {
                // If mismatch, we might want to throw error or just take what matches.
                // For now, let's allow partial or require exact match.
                // Given the requirement, let's try to map as much as possible.
                // But robust implementation should validate.
            }

            // Remove existing passengers for these items to replace with new ones
            const bookingItemIds = booking.booking_items.map((item) => item.id);
            if (bookingItemIds.length > 0) {
                // Using QueryBuilder to delete passengers related to these items
                // Note: TypeORM doesn't support easy delete by relation ID in repository.delete w/o cascade config sometimes
                // Safer to use direct delete via manager or loaded entities, but delete by criteria is faster.
                await this.bookingPassengerRepository
                    .createQueryBuilder()
                    .delete()
                    .where('booking_item_id IN (:...ids)', {
                        ids: bookingItemIds,
                    })
                    .execute();
            }

            // Create new passengers
            const newPassengers: BookingPassengerEntity[] = [];
            let passengerIndex = 0;

            // Sort items to ensure stable mapping order (e.g. by ID)
            const sortedItems = booking.booking_items.sort(
                (a, b) => a.id - b.id,
            );

            for (const item of sortedItems) {
                for (let i = 0; i < item.quantity; i++) {
                    if (passengerIndex < dto.passengers.length) {
                        const pDto = dto.passengers[passengerIndex++];
                        const passenger =
                            this.bookingPassengerRepository.create({
                                full_name: pDto.full_name,
                                phone_number: pDto.phone_number,
                                booking_item: item,
                                pax_type: item.pax_type,
                            });
                        newPassengers.push(passenger);
                    }
                }
            }

            if (newPassengers.length > 0) {
                await this.bookingPassengerRepository.save(newPassengers);
            }
        }

        // Use update to avoid cascade issues
        await this.bookingRepository.update(
            { id: booking.id },
            {
                contact_name: dto.contact_name,
                contact_email: dto.contact_email,
                contact_phone: dto.contact_phone,
                status: BookingStatus.pending_payment,
            },
        );

        return { success: true, bookingId: booking.id };
    }

    /**
     * Update payment method for current booking
     */
    async updateBookingPayment(
        userUuid: string,
        dto: UpdateBookingPaymentDto,
    ): Promise<{ success: boolean; bookingId: number }> {
        const booking = await this.bookingRepository.findOne({
            where: [
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_payment,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_confirm,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_info,
                },
            ],
            relations: ['tour_inventory_hold'],
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException(
                'No active booking found for payment update',
            );
        }

        // Check if booking hold has expired
        if (booking.tour_inventory_hold?.expires_at) {
            const expiresAt = new Date(booking.tour_inventory_hold.expires_at);
            if (expiresAt < new Date()) {
                throw new BadRequestException(
                    'Your booking hold has expired. Please start a new booking.',
                );
            }
        }

        // Validate payment method exists and is active
        const paymentMethod = await this.bookingPaymentRepository.findOne({
            where: { id: dto.booking_payment_id, status: 'active' },
        });

        if (!paymentMethod) {
            throw new BadRequestException('Invalid payment method selected');
        }

        // Validate payment method eligibility based on total amount
        const totalAmount = Number(booking.total_amount);
        const ruleMin = Number(paymentMethod.rule_min) || 0;
        const ruleMax = Number(paymentMethod.rule_max) || Infinity;

        if (totalAmount < ruleMin || totalAmount > ruleMax) {
            throw new BadRequestException(
                `This payment method requires order amount between ${ruleMin} and ${ruleMax}`,
            );
        }

        if (dto.payment_information_id) {
            const paymentInfo = await this.bookingRepository.manager
                .getRepository(PaymentInfomationEntity)
                .findOne({
                    where: { id: dto.payment_information_id },
                });
            if (paymentInfo) {
                booking.payment_information = paymentInfo;
            }
        }

        const updateData: Partial<BookingEntity> = {
            status: BookingStatus.pending_confirm,
            booking_payment: { id: paymentMethod.id } as BookingPaymentEntity,
        };
        if (dto.payment_information_id) {
            updateData.payment_information = {
                id: dto.payment_information_id,
            } as PaymentInfomationEntity;
        }
        await this.bookingRepository.update({ id: booking.id }, updateData);

        return { success: true, bookingId: booking.id };
    }

    /**
     * Confirm current booking
     */
    async confirmCurrentBooking(
        userUuid: string,
    ): Promise<{ success: boolean; bookingId: number }> {
        const booking = await this.bookingRepository.findOne({
            where: {
                user: { uuid: userUuid },
                status: BookingStatus.pending_confirm,
            },
            relations: [
                'tour_inventory_hold',
                'booking_payment',
                'payment_information',
                'currency',
                'user',
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.variant.tour.supplier',
                'booking_items.tour_session',
            ],
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException('No booking ready for confirmation');
        }

        // Check if booking hold has expired
        if (booking.tour_inventory_hold?.expires_at) {
            const expiresAt = new Date(booking.tour_inventory_hold.expires_at);
            if (expiresAt < new Date()) {
                throw new BadRequestException(
                    'Your booking hold has expired. Please start a new booking.',
                );
            }
        }
        // Check if payment method is Credit Card and process Stripe charge
        const isCreditCard =
            (booking.booking_payment?.id as unknown as PaymentCardID) ===
            PaymentCardID.CREDIT_CARD;

        if (isCreditCard) {
            if (!booking.payment_information?.customer_id) {
                throw new BadRequestException(
                    'No card information found for this booking. Please add a card.',
                );
            }

            // Charge the customer via Stripe
            const customerId = booking.payment_information.customer_id;
            const amount = Number(booking.total_amount);
            const currency = booking.currency.symbol.toLowerCase();

            const charge = await this.userPaymentService.chargeCustomer(
                customerId,
                amount,
                currency,
            );
            // Save charge ID to payment_information
            booking.payment_information.stripe_charge_id = charge.id;
            await this.paymentInfoRepository.save(booking.payment_information);
        }

        // Update booking status
        booking.status = BookingStatus.waiting_supplier;
        booking.payment_status = PaymentStatus.paid;

        // Clear expiry to prevent frontend alert
        if (booking.tour_inventory_hold) {
            booking.tour_inventory_hold.expires_at = null;
            await this.inventoryHoldRepository.save(
                booking.tour_inventory_hold,
            );
        }

        await this.bookingRepository.save(booking);

        // Send confirmation email to user
        const firstItem = booking.booking_items?.[0];
        const tour = firstItem?.variant?.tour;
        const session = firstItem?.tour_session;
        const supplier = tour?.supplier;

        try {
            await this.emailQueue.add('send-booking-confirmation', {
                email: booking.contact_email,
                data: {
                    fullName: booking.contact_name || booking.user?.full_name || 'Valued Guest',
                    bookingId: booking.id,
                    tourName: tour?.title || 'Tour',
                    startDate: session?.session_date
                        ? new Date(session.session_date).toLocaleDateString('en-US')
                        : '',
                    totalAmount: Number(booking.total_amount).toLocaleString('en-US'),
                    currency: booking.currency?.symbol || 'VND',
                    contactEmail: booking.contact_email || '',
                    contactPhone: booking.contact_phone || '',
                    viewBookingLink: `${process.env.NEXT_PUBLIC_APP_URL}/mypage/bookings/${booking.id}`,
                },
            });
            this.logger.log(`Queued booking confirmation email for booking #${booking.id}`);
        } catch (error) {
            this.logger.error(`Failed to queue confirmation email for booking #${booking.id}`, error);
        }

        // Create notification for supplier
        if (supplier?.id) {
            try {
                // Find all users belonging to this supplier
                const supplierUsers = await this.userRepository.find({
                    where: { supplier: { id: supplier.id } },
                    select: ['id'],
                });
                const supplierUserIds = supplierUsers.map((u) => u.id);

                if (supplierUserIds.length > 0) {
                    await this.notificationService.create({
                        title: `New Booking #${booking.id}`,
                        description: `You have a new booking for tour "${tour?.title || 'Tour'}". Customer: ${booking.contact_name}. Date: ${session?.session_date ? new Date(session.session_date).toLocaleDateString('en-US') : 'N/A'}.`,
                        type: NotificationType.booking,
                        is_user: true,
                        target_group: TargetGroup.specific,
                        user_ids: supplierUserIds,
                    });
                    this.logger.log(
                        `Created notification for supplier #${supplier.id} (Users: ${supplierUserIds.join(', ')}) for booking #${booking.id}`,
                    );
                }
            } catch (error) {
                this.logger.error(
                    `Failed to create notification for supplier #${supplier.id}`,
                    error,
                );
            }
        }

        return { success: true, bookingId: booking.id };
    }

    async confirmBooking(dto: ConfirmBookingDTO): Promise<BookingEntity> {
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

    /**
     * Get active payment methods, optionally filtered by booking eligibility
     */
    async getPaymentMethods(userUuid?: string): Promise<any[]> {
        let paymentMethods = await this.bookingPaymentRepository.find({
            where: { status: 'active' },
            relations: ['currency'],
            order: { id: 'ASC' },
        });

        if (userUuid) {
            const booking = await this.bookingRepository.findOne({
                where: [
                    {
                        user: { uuid: userUuid },
                        status: BookingStatus.pending_info,
                    },
                    {
                        user: { uuid: userUuid },
                        status: BookingStatus.pending_payment,
                    },
                    {
                        user: { uuid: userUuid },
                        status: BookingStatus.pending_confirm,
                    },
                ],
                order: { id: 'DESC' },
            });

            if (booking) {
                const totalAmount = Number(booking.total_amount);
                paymentMethods = paymentMethods.filter((method) => {
                    const ruleMin = Number(method.rule_min) || 0;
                    const ruleMax = Number(method.rule_max) || 0;

                    if (totalAmount < ruleMin) return false;
                    if (ruleMax > 0 && totalAmount > ruleMax) return false;

                    return true;
                });
            }
        }

        return paymentMethods.map((method) => ({
            id: method.id,
            payment_method_name: method.payment_method_name,
            rule_min: method.rule_min,
            rule_max: method.rule_max,
            currency: method.currency?.symbol || '',
        }));
    }

    /**
     * Cancel current pending booking and release inventory hold
     */
    async cancelCurrentBooking(
        userUuid: string,
    ): Promise<{ success: boolean; message: string }> {
        // Find any pending booking
        const booking = await this.bookingRepository.findOne({
            where: [
                { user: { uuid: userUuid }, status: BookingStatus.pending },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_info,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_payment,
                },
                {
                    user: { uuid: userUuid },
                    status: BookingStatus.pending_confirm,
                },
            ],
            relations: [
                'tour_inventory_hold',
                'booking_items',
                'booking_items.booking_passengers',
            ],
            order: { id: 'DESC' },
        });

        if (!booking) {
            throw new NotFoundException('No active booking found to cancel');
        }

        // Release inventory hold
        if (booking.tour_inventory_hold) {
            await this.inventoryHoldRepository.update(
                { id: booking.tour_inventory_hold.id },
                { expires_at: new Date(0) },
            );
        }

        // Soft Delete passengers
        for (const item of booking.booking_items || []) {
            if (item.booking_passengers?.length) {
                const pIds = item.booking_passengers.map((p) => p.id);
                if (pIds.length > 0) {
                    await this.bookingPassengerRepository.softDelete(pIds);
                }
            }
        }

        // Update booking status to cancelled
        await this.bookingRepository.update(
            { id: booking.id },
            { status: BookingStatus.cancelled },
        );

        return { success: true, message: 'Booking cancelled successfully' };
    }

    /**
     * Calculate refund amount based on supplier policy
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

        const firstItem = booking.booking_items?.[0];
        if (!firstItem) throw new BadRequestException('Booking has no items');

        const session = firstItem.tour_session;
        const policy = firstItem.variant?.tour_policy;

        if (!policy) {
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

        // Find applicable rule (closest before_hours that is <= diffHours)
        const rules = (policy.tour_policy_rules || []).sort(
            (a, b) => b.before_hours - a.before_hours,
        );
        let applicableFeePct = 100; // Default to 100% fee if no rules match

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
            refundAmount,
            feeAmount,
            feePct: applicableFeePct,
        };
    }

    /**
     * Cancel a confirmed booking and process refund
     */
    async cancelConfirmedBooking(
        id: number,
        user: UserEntity,
    ): Promise<{ success: boolean; message: string; refundAmount: number }> {
        const booking = await this.bookingRepository.findOne({
            where: { id, user: { uuid: user.uuid } },
            relations: ['currency', 'tour_inventory_hold', 'payment_information'],
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (
            ![BookingStatus.confirmed, BookingStatus.waiting_supplier].includes(
                booking.status,
            )
        ) {
            throw new BadRequestException(
                'Only confirmed or waiting bookings can be cancelled here',
            );
        }

        // Always calculate refund based on policy, regardless of status
        const result = await this.calculateRefund(id);
        const refundAmount = result.refundAmount;

        const stripeChargeId = booking.payment_information?.stripe_charge_id;

        if (refundAmount > 0 && stripeChargeId) {
            await this.userPaymentService.refundCharge(
                stripeChargeId,
                refundAmount,
                booking.currency.symbol,
            );
        }

        // Update booking
        booking.status = BookingStatus.cancelled;
        booking.payment_status =
            refundAmount > 0 ? PaymentStatus.refunded : booking.payment_status;
        booking.refund_amount = refundAmount;

        // Release inventory hold
        if (booking.tour_inventory_hold) {
            booking.tour_inventory_hold.expires_at = new Date(0);
            await this.inventoryHoldRepository.save(
                booking.tour_inventory_hold,
            );
        }

        await this.bookingRepository.save(booking);

        return {
            success: true,
            message: 'Booking cancelled and refund processed',
            refundAmount,
        };
    }

    async downloadReceipt(
        id: number,
        user: UserEntity,
        res: express.Response,
    ): Promise<void> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'user',
                'booking_payment',
                'payment_information',
                'currency',
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.user.uuid !== user.uuid)
            throw new ForbiddenException(
                'You do not have permission to access this receipt',
            );
        if (booking.status !== BookingStatus.confirmed)
            throw new BadRequestException(
                'Receipt is only available for confirmed bookings',
            );

        const doc = new PDFDocument();
        const fontPath = path.join(
            __dirname,
            '../../../assets/fonts/RobotoFlex-VariableFont.ttf',
        );
        doc.registerFont('vn', fontPath);
        doc.font('vn');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=receipt-${booking.id}.pdf`,
        );
        doc.pipe(res);

        // Header
        doc.fillColor('#1a365d')
            .fontSize(25)
            .text('BOOKING RECEIPT', { align: 'center' });
        doc.moveDown();
        doc.fillColor('#4a5568')
            .fontSize(12)
            .text(`Receipt No: REC-${booking.id}`, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, {
            align: 'right',
        });
        doc.moveDown();

        // Brand
        doc.fillColor('#3182ce').fontSize(20).text('TripConnect', 50, 100);
        doc.fillColor('#718096')
            .fontSize(10)
            .text('123 Innovation Plaza, Saigon High Tech Park', 50, 125);
        doc.text('support@tripconnect.com | +84 123 456 789', 50, 140);

        doc.moveTo(50, 160).lineTo(550, 160).strokeColor('#e2e8f0').stroke();
        doc.moveDown(2);

        // Payment Info
        doc.fillColor('#2d3748')
            .fontSize(14)
            .text('Payment Information', 50, 180);
        doc.moveDown();
        doc.fillColor('#4a5568').fontSize(11);
        doc.text(`Customer Name: ${booking.contact_name}`);
        doc.text(`Customer Email: ${booking.contact_email}`);
        doc.text(
            `Payment Method: ${booking.booking_payment?.payment_method_name || 'N/A'}`,
        );
        if (booking.payment_information) {
            doc.text(
                `Card: ${booking.payment_information.brand} **** ${booking.payment_information.last4}`,
            );
        }
        doc.text(`Status: PAID`, { continued: true })
            .fillColor('#38a169')
            .text(' (Confirmed)');

        doc.moveDown(2);

        // Total Amount
        doc.rect(50, 300, 500, 50).fill('#f7fafc');
        doc.fillColor('#2d3748').fontSize(16).text('Total Paid', 70, 315);
        const amountStr = `${Number(booking.total_amount).toLocaleString()} ${booking.currency?.symbol || 'VND'}`;
        doc.fillColor('#3182ce')
            .fontSize(20)
            .text(amountStr, 350, 312, { align: 'right', width: 180 });

        // Footer
        doc.fillColor('#a0aec0')
            .fontSize(10)
            .text('Thank you for choosing TripConnect!', 50, 700, {
                align: 'center',
            });

        doc.end();
    }

    async downloadInvoice(
        id: number,
        user: UserEntity,
        res: express.Response,
    ): Promise<void> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: [
                'user',
                'booking_items',
                'booking_items.variant',
                'booking_items.variant.tour',
                'booking_items.pax_type',
                'currency',
                'booking_payment',
            ],
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.user.uuid !== user.uuid)
            throw new ForbiddenException(
                'You do not have permission to access this invoice',
            );
        if (booking.status !== BookingStatus.confirmed)
            throw new BadRequestException(
                'Invoice is only available for confirmed bookings',
            );

        const doc = new PDFDocument();
        const fontPath = path.join(
            __dirname,
            '../../../assets/fonts/RobotoFlex-VariableFont.ttf',
        );
        doc.registerFont('vn', fontPath);
        doc.font('vn');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${booking.id}.pdf`,
        );
        doc.pipe(res);

        // Header
        doc.fillColor('#1a365d')
            .fontSize(25)
            .text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fillColor('#4a5568')
            .fontSize(12)
            .text(`Invoice No: INV-${booking.id}`, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, {
            align: 'right',
        });
        doc.moveDown();

        // Brand
        doc.fillColor('#3182ce').fontSize(20).text('TripConnect', 50, 100);
        doc.fillColor('#718096')
            .fontSize(10)
            .text('123 Innovation Plaza, Saigon High Tech Park', 50, 125);
        doc.moveDown(2);

        // Bill To
        doc.fillColor('#2d3748').fontSize(14).text('Bill To', 50, 170);
        doc.fillColor('#4a5568').fontSize(11);
        doc.text(booking.contact_name);
        doc.text(booking.contact_email);
        doc.text(booking.contact_phone);
        doc.moveDown(2);

        // Table Header
        const tableTop = 250;
        doc.fillColor('#1e40af').fontSize(10).text('Description', 50, tableTop);
        doc.text('Qty', 300, tableTop);
        doc.text('Unit Price', 350, tableTop, { width: 90, align: 'right' });
        doc.text('Total', 450, tableTop, { width: 100, align: 'right' });

        doc.moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .strokeColor('#cbd5e1')
            .stroke();

        // Table Rows
        let y = tableTop + 30;
        booking.booking_items.forEach((item) => {
            doc.fillColor('#4b5563').fontSize(10);
            doc.text(
                `${item.variant.tour.title} (${item.pax_type.name})`,
                50,
                y,
                { width: 240 },
            );
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`${Number(item.unit_price).toLocaleString()}`, 350, y, {
                width: 90,
                align: 'right',
            });
            doc.text(`${Number(item.total_amount).toLocaleString()}`, 450, y, {
                width: 100,
                align: 'right',
            });
            y += 20;
        });

        doc.moveTo(50, y + 10)
            .lineTo(550, y + 10)
            .strokeColor('#cbd5e1')
            .stroke();

        // Summary
        y += 30;
        doc.fillColor('#1e293b').fontSize(12).text('Total Amount:', 350, y);
        const amountStr = `${Number(booking.total_amount).toLocaleString()} ${booking.currency?.symbol || 'VND'}`;
        doc.fillColor('#2563eb')
            .fontSize(14)
            .text(amountStr, 450, y, { width: 100, align: 'right' });

        // Footer
        doc.fillColor('#94a3b8')
            .fontSize(9)
            .text(
                'Payment was received via ' +
                (booking.booking_payment?.payment_method_name ||
                    'Credit Card'),
                50,
                700,
                { align: 'center' },
            );

        doc.end();
    }

    async getAllBookingsByUser(
        userUuid: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: UserBookingDetailDTO[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const [bookings, total] = await this.bookingRepository.findAndCount({
            where: { user: { uuid: userUuid } },
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
                'booking_items.booking_passengers',
            ],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: bookings.map((b) => this.formatBookingDetail(b)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}

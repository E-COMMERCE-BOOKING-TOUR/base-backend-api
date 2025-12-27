import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { BookingStatus, PaymentStatus } from '../dto/booking.dto';
import { UserPaymentService } from '@/module/user/service/user-payment.service';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { NotificationService } from '@/module/user/service/notification.service';
import { TargetGroup, NotificationType } from '@/module/user/dtos/notification.dto';

@Injectable()
export class BookingCleanupScheduler {
    private readonly logger = new Logger(BookingCleanupScheduler.name);

    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
        private readonly userPaymentService: UserPaymentService,
        private readonly notificationService: NotificationService,
    ) { }

    @Cron(CronExpression.EVERY_10_MINUTES) // Check every 10 minutes
    async handleExpiredBookings() {
        this.logger.debug('Running expired bookings cleanup...');

        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        try {
            // Stage 1: Notify Supplier (6h passed since creation/update, not yet notified)
            const bookingsToNotify = await this.bookingRepository.find({
                where: {
                    status: BookingStatus.waiting_supplier,
                    is_supplier_notified: false,
                    updated_at: LessThan(sixHoursAgo),
                },
                relations: [
                    'booking_items',
                    'booking_items.variant',
                    'booking_items.variant.tour',
                    'booking_items.variant.tour.supplier',
                    'booking_items.variant.tour.supplier.users',
                ],
            });

            for (const booking of bookingsToNotify) {
                await this.notifySupplier(booking);
            }

            // Stage 2: Auto-Cancel & Refund (6h passed since notification = 12h total approx)
            const bookingsToCancel = await this.bookingRepository.find({
                where: {
                    status: BookingStatus.waiting_supplier,
                    is_supplier_notified: true,
                    supplier_notified_at: LessThan(sixHoursAgo),
                },
                relations: ['payment_information', 'currency', 'tour_inventory_hold'],
            });

            if (bookingsToCancel.length > 0) {
                this.logger.log(`Found ${bookingsToCancel.length} expired bookings to auto-cancel (Stage 2).`);
                for (const booking of bookingsToCancel) {
                    await this.processRefundAndCancel(booking);
                }
            }
        } catch (error) {
            this.logger.error('Error in handling expired bookings', error);
        }
    }

    private async notifySupplier(booking: BookingEntity) {
        try {
            this.logger.log(`Notifying supplier for booking ${booking.id} (Stage 1 timeout)`);

            // Get supplier user IDs
            const userIds: number[] = [];
            for (const item of booking.booking_items || []) {
                const users = item.variant?.tour?.supplier?.users || [];
                for (const user of users) {
                    if (!userIds.includes(user.id)) {
                        userIds.push(user.id);
                    }
                }
            }

            if (userIds.length > 0) {
                await this.notificationService.create({
                    title: 'Action Required: Booking Confirmation Pending',
                    description: `Booking #${booking.id} for tour "${booking.booking_items?.[0]?.variant?.tour?.title}" has been pending for over 6 hours. Please confirm or reject it soon to avoid automatic cancellation.`,
                    type: NotificationType.alert,
                    is_error: false,
                    is_user: true,
                    target_group: TargetGroup.specific,
                    user_ids: userIds,
                });
            }

            booking.is_supplier_notified = true;
            booking.supplier_notified_at = new Date();
            await this.bookingRepository.save(booking);

            // TODO: Send Email
            // this.mailService.sendSupplierWarningEmail(booking);

        } catch (error) {
            this.logger.error(`Failed to notify supplier for booking ${booking.id}`, error);
        }
    }

    private async processRefundAndCancel(booking: BookingEntity) {
        try {
            this.logger.log(`Processing Stage 2 timeout for booking ${booking.id}`);

            // 1. Process Refund
            const refundAmount = Number(booking.total_amount);
            const stripeChargeId = booking.payment_information?.stripe_charge_id;

            if (refundAmount > 0 && stripeChargeId) {
                try {
                    await this.userPaymentService.refundCharge(
                        stripeChargeId,
                        refundAmount,
                        booking.currency?.symbol || 'VND', // fallback
                    );
                    booking.payment_status = PaymentStatus.refunded;
                    booking.refund_amount = refundAmount;
                } catch (paymentError) {
                    this.logger.error(`Failed to refund booking ${booking.id}`, paymentError);
                }
            }

            // 2. Update Status
            booking.status = BookingStatus.cancelled;
            booking.cancel_reason = 'System Auto-Cancel: Supplier confirmation timeout (12 hours total)';

            // 3. Release Inventory
            if (booking.tour_inventory_hold) {
                booking.tour_inventory_hold.expires_at = new Date(0);
                await this.inventoryHoldRepository.save(booking.tour_inventory_hold);
            }

            // 4. Save
            await this.bookingRepository.save(booking);
            this.logger.log(`Auto-cancelled booking ${booking.id}`);

        } catch (error) {
            this.logger.error(`Failed to process auto-cancel for booking ${booking.id}`, error);
        }
    }
}

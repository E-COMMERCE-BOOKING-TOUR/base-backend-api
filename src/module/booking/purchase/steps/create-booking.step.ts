import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../entity/booking.entity';
import { BookingItemEntity } from '../../entity/bookingItem.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';
import { BookingStatus, PaymentStatus } from '../../dto/booking.dto';

@Injectable()
export class CreateBookingStep implements PurchaseStep {
    priority = 80;

    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(BookingItemEntity)
        private readonly bookingItemRepository: Repository<BookingItemEntity>,
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (
            !ctx.user ||
            !ctx.variant ||
            !ctx.bookingItems ||
            !ctx.inventoryHold ||
            ctx.totalAmount === undefined
        ) {
            throw new Error(
                'All required entities must be resolved before creating booking',
            );
        }

        // Create booking
        const booking = this.bookingRepository.create({
            contact_name: ctx.user.full_name,
            contact_email: ctx.user.email,
            contact_phone: ctx.user.phone || '',
            total_amount: ctx.totalAmount,
            status: BookingStatus.pending,
            payment_status: PaymentStatus.unpaid,
            user: ctx.user,
            currency: ctx.variant.currency,
            payment_information: ctx.paymentInfo || undefined,
            tour_inventory_hold: ctx.inventoryHold,
            booking_payment: ctx.bookingPayment || undefined,
            booking_items: ctx.bookingItems,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        // Save booking items with booking reference
        for (const item of ctx.bookingItems) {
            item.booking = savedBooking;
            await this.bookingItemRepository.save(item);
        }

        // Update inventory hold with booking reference
        ctx.inventoryHold.booking = savedBooking;
        await this.inventoryHoldRepository.save(ctx.inventoryHold);

        return {
            ...ctx,
            booking: savedBooking,
        };
    }
}

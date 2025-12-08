import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BookingItemEntity } from '../../entity/bookingItem.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class CreateBookingItemsStep implements PurchaseStep {
    priority = 70;

    constructor(
        @InjectRepository(BookingItemEntity)
        private readonly bookingItemRepository: Repository<BookingItemEntity>,
        @InjectRepository(TourPaxTypeEntity)
        private readonly paxTypeRepository: Repository<TourPaxTypeEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.variant || !ctx.session || !ctx.prices) {
            throw new Error(
                'Variant, session, and prices must be resolved before creating booking items',
            );
        }

        // Load all pax types at once
        const paxTypeIds = ctx.pax.map((p) => p.paxTypeId);
        const paxTypes = await this.paxTypeRepository.find({
            where: { id: In(paxTypeIds) },
        });
        const paxTypeMap = new Map(paxTypes.map((pt) => [pt.id, pt]));

        const bookingItems: BookingItemEntity[] = [];
        let totalAmount = 0;

        for (const p of ctx.pax) {
            const priceInfo = ctx.prices.find(
                (pr) => pr.paxTypeId === p.paxTypeId,
            );
            const unitPrice = priceInfo?.finalPrice ?? 0;
            const amount = unitPrice * p.quantity;
            totalAmount += amount;

            const paxType = paxTypeMap.get(p.paxTypeId);
            if (!paxType) {
                throw new Error(`Pax type with id ${p.paxTypeId} not found`);
            }

            const bookingItem = this.bookingItemRepository.create({
                variant: ctx.variant,
                pax_type: paxType,
                tour_session: ctx.session,
                quantity: p.quantity,
                unit_price: unitPrice,
                total_amount: amount,
            });

            bookingItems.push(bookingItem);
        }

        return {
            ...ctx,
            bookingItems,
            totalAmount,
        };
    }
}


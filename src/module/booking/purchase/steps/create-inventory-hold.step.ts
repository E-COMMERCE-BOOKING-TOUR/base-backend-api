import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class CreateInventoryHoldStep implements PurchaseStep {
    priority = 40;

    constructor(
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
    ) { }

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.session) {
            throw new Error(
                'Session must be resolved before creating inventory hold',
            );
        }

        // Re-fetch session with relations to get accurate capacity status
        const session = await this.inventoryHoldRepository.manager
            .getRepository(TourSessionEntity)
            .findOne({
                where: { id: ctx.session.id },
                relations: ['booking_items', 'booking_items.booking', 'tour_inventory_holds', 'tour_variant'],
            });

        if (!session) {
            throw new Error('Session not found during hold creation');
        }

        const totalQuantity = ctx.pax.reduce((sum, p) => sum + p.quantity, 0);

        // Capacity calculation logic
        const totalCapacity = session.capacity ?? session.tour_variant?.capacity_per_slot ?? 0;
        const booked = (session.booking_items ?? []).reduce(
            (sum, item) =>
                item.booking && item.booking.status !== 'cancelled'
                    ? sum + (item.quantity || 0)
                    : sum,
            0,
        );
        const held = (session.tour_inventory_holds ?? []).reduce(
            (sum, hold) =>
                hold.expires_at && new Date(hold.expires_at) > new Date()
                    ? sum + (hold.quantity || 0)
                    : sum,
            0,
        );
        const available = Math.max(0, totalCapacity - booked - held);

        if (totalQuantity > available) {
            throw new BadRequestException(
                `Only ${available} spots available for this session. Please reduce passenger count or choose another date.`,
            );
        }

        const hold = this.inventoryHoldRepository.create({
            tour_session: session,
            quantity: totalQuantity,
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 mins hold
        });

        await this.inventoryHoldRepository.save(hold);

        return {
            ...ctx,
            inventoryHold: hold,
            session, // Update session in context with loaded relations if needed
        };
    }
}

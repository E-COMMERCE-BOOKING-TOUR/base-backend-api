import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class CreateInventoryHoldStep implements PurchaseStep {
    priority = 40;

    constructor(
        @InjectRepository(TourInventoryHoldEntity)
        private readonly inventoryHoldRepository: Repository<TourInventoryHoldEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.session) {
            throw new Error(
                'Session must be resolved before creating inventory hold',
            );
        }

        const totalQuantity = ctx.pax.reduce((sum, p) => sum + p.quantity, 0);

        const hold = this.inventoryHoldRepository.create({
            tour_session: ctx.session,
            quantity: totalQuantity,
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 mins hold
        });

        await this.inventoryHoldRepository.save(hold);

        return {
            ...ctx,
            inventoryHold: hold,
        };
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class ResolveSessionStep implements PurchaseStep {
    priority = 30;

    constructor(
        @InjectRepository(TourSessionEntity)
        private readonly sessionRepository: Repository<TourSessionEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.variant) {
            throw new Error('Variant must be resolved before resolving session');
        }

        // Find existing session for the date
        let session = ctx.variant.tour_sessions?.find(
            (s) =>
                new Date(s.session_date).toISOString().split('T')[0] ===
                ctx.startDate,
        );

        // Create a new session if not exists
        if (!session) {
            session = this.sessionRepository.create({
                session_date: new Date(ctx.startDate),
                tour_variant: ctx.variant,
                capacity: 100, // Default capacity
                status: 'active',
            });
            await this.sessionRepository.save(session);
        }

        return {
            ...ctx,
            session,
        };
    }
}


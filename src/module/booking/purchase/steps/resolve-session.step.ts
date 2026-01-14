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
    ) { }

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.variant) {
            throw new Error(
                'Variant must be resolved before resolving session',
            );
        }

        let session: TourSessionEntity | undefined;

        if (ctx.tourSessionId) {
            // If explicit session ID provided (e.g. for specific time slot)
            const foundSession = ctx.variant.tour_sessions?.find(
                (s) => s.id === ctx.tourSessionId,
            );
            if (!foundSession) {
                // Try fetching if not in relation (though relations should be loaded)
                const dbSession = await this.sessionRepository.findOne({
                    where: { id: ctx.tourSessionId },
                    relations: ['tour_variant'],
                });
                if (!dbSession) {
                    throw new Error(
                        `Tour session with ID ${ctx.tourSessionId} not found`,
                    );
                }
                session = dbSession;
                // Validate it belongs to variant
                if (session.tour_variant?.id !== ctx.variant.id) {
                    throw new Error(
                        'Session does not belong to the selected variant',
                    );
                }
            } else {
                session = foundSession;
            }
        } else {
            // Find existing session for the date (legacy/default behavior)
            session = ctx.variant.tour_sessions?.find(
                (s) =>
                    new Date(s.session_date).toISOString().split('T')[0] ===
                    ctx.startDate,
            );
        }

        // Create a new session if not exists and valid date
        if (!session) {
            // Only create if we are looking by date. If by ID, we threw error.
            if (ctx.tourSessionId) {
                // Should have been caught above, but safety check
                throw new Error(
                    `Tour session with ID ${ctx.tourSessionId} not found`,
                );
            }

            session = this.sessionRepository.create({
                session_date: new Date(ctx.startDate),
                tour_variant: ctx.variant,
                capacity: ctx.variant.capacity_per_slot || 100,
                status: 'open',
            });
            await this.sessionRepository.save(session);
        }

        return {
            ...ctx,
            session,
        };
    }
}

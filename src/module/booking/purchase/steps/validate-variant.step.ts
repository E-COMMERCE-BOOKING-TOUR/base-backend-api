import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class ValidateVariantStep implements PurchaseStep {
    priority = 20;

    constructor(
        @InjectRepository(TourVariantEntity)
        private readonly variantRepository: Repository<TourVariantEntity>,
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        const variant = await this.variantRepository.findOne({
            where: { id: ctx.variantId },
            relations: ['tour', 'tour_sessions', 'currency'],
        });

        if (!variant) {
            throw new Error('Variant not found');
        }

        // Load tour with pricing relations
        const tour = await this.tourRepository.findOne({
            where: { id: variant.tour.id },
            relations: [
                'variants',
                'variants.tour_variant_pax_type_prices',
                'variants.tour_variant_pax_type_prices.pax_type',
                'variants.tour_price_rules',
                'variants.tour_price_rules.tour_rule_pax_type_prices',
                'variants.tour_price_rules.tour_rule_pax_type_prices.pax_type',
            ],
        });

        if (!tour) {
            throw new Error('Tour not found');
        }

        return {
            ...ctx,
            variant,
            tour,
        };
    }
}

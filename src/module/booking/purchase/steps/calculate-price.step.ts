import { Injectable } from '@nestjs/common';
import { PricingService } from '@/module/pricing/pricing.service';
import { UserTourService } from '@/module/tour/service/user-tour.service';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class CalculatePriceStep implements PurchaseStep {
    priority = 60;

    constructor(
        private readonly pricingService: PricingService,
        private readonly userTourService: UserTourService,
    ) { }

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.tour) {
            throw new Error('Tour must be resolved before calculating price');
        }

        if (!ctx.variant) {
            throw new Error('Variant must be resolved before calculating price');
        }

        // Find the variant within the loaded tour to ensure we have all relations
        const targetVariant = ctx.tour.variants?.find(
            (v) => v.id === ctx.variant?.id,
        );

        if (!targetVariant) {
            throw new Error('Target variant not found in tour data');
        }

        const prices = await this.userTourService.computeVariantPricing(targetVariant);

        return {
            ...ctx,
            prices,
        };
    }
}


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
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.tour) {
            throw new Error('Tour must be resolved before calculating price');
        }

        const prices = await this.userTourService.computeTourPricing(ctx.tour);

        return {
            ...ctx,
            prices,
        };
    }
}


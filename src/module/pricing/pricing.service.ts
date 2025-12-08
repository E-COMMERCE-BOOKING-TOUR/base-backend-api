import { Inject, Injectable } from "@nestjs/common";
import { PriceContext, PriceStep } from "./types/index.interface";

@Injectable()
export class PricingService {
    constructor(@Inject('PRICE_STEPS') private readonly steps: PriceStep[]) { }

    async calculate(initialContext: PriceContext): Promise<PriceContext> {
        const ctx: PriceContext = {
            ...initialContext,
            breakdown: initialContext.breakdown || [],
            meta: initialContext.meta || {},
        };

        for (const step of this.steps) {
            const result = step.execute(ctx);
            if (result instanceof Promise) {
                await result;
            }
        }

        return ctx;
    }
}

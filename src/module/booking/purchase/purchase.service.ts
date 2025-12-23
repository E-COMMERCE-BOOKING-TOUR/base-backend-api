import { Inject, Injectable } from '@nestjs/common';
import { PurchaseContext, PurchaseStep } from './types/index.interface';

@Injectable()
export class PurchaseService {
    constructor(
        @Inject('PURCHASE_STEPS')
        private readonly steps: PurchaseStep[],
    ) {}

    async execute(initialContext: PurchaseContext): Promise<PurchaseContext> {
        const ctx: PurchaseContext = {
            ...initialContext,
            meta: initialContext.meta || {},
        };

        for (const step of this.steps) {
            const result = await step.execute(ctx);
            Object.assign(ctx, result);
        }

        return ctx;
    }
}

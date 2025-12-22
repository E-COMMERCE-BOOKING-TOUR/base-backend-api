import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';

@Injectable()
export class BasePriceStep implements PriceStep {
    priority = 10;
    execute(ctx: PriceContext): PriceContext {
        if (!ctx.items || ctx.items.length === 0) return ctx;

        const sum = ctx.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
        ctx.breakdown.push({
            id: 'base',
            amount: sum,
            description: 'Base price',
        });
        ctx.meta = { ...(ctx.meta ?? {}), items_total: sum };
        return ctx;
    }
}

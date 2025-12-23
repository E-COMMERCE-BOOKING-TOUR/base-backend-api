import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';

@Injectable()
export class TaxStep implements PriceStep {
    priority = 90;
    execute(ctx: PriceContext): PriceContext {
        const subtotal = ctx.breakdown.reduce((s, l) => s + l.amount, 0);
        const tax = subtotal * 0.1; // 10% tax
        ctx.breakdown.push({ id: 'tax', amount: tax, description: 'Tax 10%' });
        return ctx;
    }
}

import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';
import { TourPriceRuleEntity } from '@/module/tour/entity/tourPriceRule.entity';
import { TourRulePaxTypePriceEntity } from '@/module/tour/entity/tourRulePaxTypePrice.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';

type RuleEntry = {
    effectivePrice: number;
    rule: TourPriceRuleEntity;
    rulePrice: TourRulePaxTypePriceEntity;
};

@Injectable()
export class TourRulePriceStep implements PriceStep {
    priority = 20;

    execute(ctx: PriceContext): PriceContext {
        const activeVariants = (ctx.meta?.activeVariants ??
            []) as TourVariantEntity[];
        const basePriceMap = ctx.meta?.basePriceMap as
            | Map<number, { price: number }>
            | undefined;

        if (!basePriceMap || !activeVariants.length) return ctx;

        const ruleMap = new Map<number, RuleEntry>();

        for (const variant of activeVariants) {
            const rules: TourPriceRuleEntity[] = variant.tour_price_rules ?? [];

            for (const rule of rules) {
                const rulePaxPrices: TourRulePaxTypePriceEntity[] =
                    rule.tour_rule_pax_type_prices ?? [];

                for (const rp of rulePaxPrices) {
                    const paxType = rp.pax_type;
                    if (!paxType) continue;

                    const paxTypeId = paxType.id;
                    const baseForPax = basePriceMap.get(paxTypeId)?.price ?? null;

                    let effectivePrice: number | null = null;

                    if (rule.price_type === 'absolute') {
                        effectivePrice = rp.price;
                    } else if (rule.price_type === 'delta') {
                        if (baseForPax != null) {
                            effectivePrice = baseForPax + rp.price;
                        }
                    }

                    if (effectivePrice == null || effectivePrice <= 0) {
                        continue;
                    }

                    const current = ruleMap.get(paxTypeId);
                    if (
                        !current ||
                        (rule.priority ?? 0) > (current.rule.priority ?? 0)
                    ) {
                        ruleMap.set(paxTypeId, { effectivePrice, rule, rulePrice: rp });
                    }
                }
            }
        }

        ctx.meta = {
            ...(ctx.meta ?? {}),
            ruleMap,
        };

        return ctx;
    }
}


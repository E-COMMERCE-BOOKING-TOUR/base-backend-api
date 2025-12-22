import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';
import { TourPaxTypePriceDto } from '@/module/tour/dto/tour.dto';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

@Injectable()
export class TourAssemblePriceStep implements PriceStep {
    priority = 30;

    execute(ctx: PriceContext): PriceContext {
        const basePriceMap = ctx.meta?.basePriceMap as
            | Map<number, { price: number; paxType: TourPaxTypeEntity }>
            | undefined;
        const ruleMap = ctx.meta?.ruleMap as
            | Map<
                  number,
                  {
                      effectivePrice: number;
                      rule: { price_type: string };
                  }
              >
            | undefined;
        const activeVariants = (ctx.meta?.activeVariants ??
            []) as TourVariantEntity[];

        const allPaxTypeIds = new Set<number>([
            ...(basePriceMap?.keys() ?? []),
            ...(ruleMap?.keys() ?? []),
        ]);

        const result: TourPaxTypePriceDto[] = [];

        for (const paxTypeId of allPaxTypeIds) {
            const base = basePriceMap?.get(paxTypeId);
            const basePrice = base?.price ?? null;

            const ruleEntry = ruleMap?.get(paxTypeId);
            const rulePrice = ruleEntry?.effectivePrice ?? null;

            let finalPrice: number | null = null;
            let priceSource: TourPaxTypePriceDto['priceSource'] = 'none';
            let priceLayer: TourPaxTypePriceDto['priceLayer'] = 'none';

            if (rulePrice != null && rulePrice > 0) {
                finalPrice = rulePrice;
                priceLayer = 'rule';
                priceSource =
                    ruleEntry!.rule.price_type === 'absolute'
                        ? 'rule_absolute'
                        : 'rule_delta';
            } else if (basePrice != null && basePrice > 0) {
                finalPrice = basePrice;
                priceLayer = 'base';
                priceSource = 'base';
            }

            const paxType =
                base?.paxType ??
                activeVariants
                    .flatMap((v) => v.tour_price_rules ?? [])
                    .flatMap((r) => r.tour_rule_pax_type_prices ?? [])
                    .find((rp) => rp.pax_type?.id === paxTypeId)?.pax_type;

            result.push({
                paxTypeId,
                paxTypeName: paxType?.name ?? '',
                minAge: paxType?.min_age ?? null,
                maxAge: paxType?.max_age ?? null,
                basePrice,
                rulePrice,
                finalPrice,
                priceSource,
                priceLayer,
            });
        }

        result.sort((a, b) => a.paxTypeId - b.paxTypeId);

        ctx.meta = {
            ...(ctx.meta ?? {}),
            priceResult: result,
        };

        return ctx;
    }
}

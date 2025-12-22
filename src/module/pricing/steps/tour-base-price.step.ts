import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

type BasePriceEntry = { price: number; paxType: TourPaxTypeEntity };

@Injectable()
export class TourBasePriceStep implements PriceStep {
    priority = 10;

    execute(ctx: PriceContext): PriceContext {
        const targetVariant = ctx.meta?.variant as
            | TourVariantEntity
            | undefined;
        let activeVariants: TourVariantEntity[] = [];

        if (targetVariant) {
            activeVariants = [targetVariant];
        } else {
            const tour = ctx.meta?.tour as TourEntity | undefined;
            if (!tour) return ctx;
            activeVariants =
                tour.variants?.filter((v) => v.status === 'active') ?? [];
        }

        const basePriceMap = new Map<number, BasePriceEntry>();

        for (const variant of activeVariants) {
            const prices = variant.tour_variant_pax_type_prices ?? [];
            for (const p of prices) {
                if (!p.price || p.price <= 0) continue;
                const paxType = p.pax_type;
                if (!paxType) continue;

                const paxTypeId = paxType.id;
                const current = basePriceMap.get(paxTypeId);

                // If targeting specific variant, overwrite/set. If scanning all (tour level), find min.
                if (targetVariant) {
                    basePriceMap.set(paxTypeId, { price: p.price, paxType });
                } else {
                    if (!current || p.price < current.price) {
                        basePriceMap.set(paxTypeId, {
                            price: p.price,
                            paxType,
                        });
                    }
                }
            }
        }

        ctx.meta = {
            ...(ctx.meta ?? {}),
            activeVariants, // Note: this might override original 'activeVariants' meaning in context, but for pricing result it is fine
            basePriceMap,
        };

        return ctx;
    }
}

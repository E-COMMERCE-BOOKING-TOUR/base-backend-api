import { Injectable } from '@nestjs/common';
import { PriceContext, PriceStep } from '../types/index.interface';
import { TourPaxTypePriceDto } from '@/module/tour/dto/tour.dto';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

@Injectable()
export class TourAssemblePriceStep implements PriceStep {
    priority = 30;

    execute(ctx: PriceContext): PriceContext {
        const basePriceMap = ctx.meta?.basePriceMap as
            | Map<number, { price: number; paxType: TourPaxTypeEntity }>
            | undefined;

        if (!basePriceMap) return ctx;

        const result: TourPaxTypePriceDto[] = [];

        for (const [paxTypeId, base] of basePriceMap.entries()) {
            const basePrice = base?.price ?? null;
            const paxType = base?.paxType;

            let finalPrice: number | null = null;
            let priceSource: TourPaxTypePriceDto['priceSource'] = 'none';
            let priceLayer: TourPaxTypePriceDto['priceLayer'] = 'none';

            if (basePrice != null && basePrice > 0) {
                finalPrice = basePrice;
                priceLayer = 'base';
                priceSource = 'base';
            }

            result.push({
                paxTypeId,
                paxTypeName: paxType?.name ?? '',
                minAge: paxType?.min_age ?? null,
                maxAge: paxType?.max_age ?? null,
                basePrice,
                rulePrice: null,
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

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourPriceRuleEntity } from '@/module/tour/entity/tourPriceRule.entity';
import { TourRulePaxTypePriceEntity } from '@/module/tour/entity/tourRulePaxTypePrice.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { TourStatus } from '@/module/tour/dto/tour.dto';

export default class TourPriceRuleSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const ruleRepository = dataSource.getRepository(TourPriceRuleEntity);
        const rulePriceRepository = dataSource.getRepository(
            TourRulePaxTypePriceEntity,
        );
        const variantRepository = dataSource.getRepository(TourVariantEntity);
        const paxTypeRepository = dataSource.getRepository(TourPaxTypeEntity);

        const variants = await variantRepository.find({
            where: { status: 'active' },
            relations: [
                'tour',
                'currency',
                'tour_variant_pax_type_prices',
                'tour_variant_pax_type_prices.pax_type',
            ],
        });

        const paxTypes = await paxTypeRepository.find();

        if (variants.length === 0 || paxTypes.length === 0) {
            console.log(
                '⚠️ Required data not found, skipping tour price rule seeder',
            );
            return;
        }

        const today = new Date();
        const year = today.getFullYear();

        for (const variant of variants) {
            if (
                (variant.tour.status as unknown as TourStatus) ===
                TourStatus.draft
            )
                continue;

            // High season rule (Summer: June - August)
            const summerStart = new Date(`${year}-06-01`);
            const summerEnd = new Date(`${year}-08-31`);
            const summerRule = await ruleRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    start_date: summerStart,
                    end_date: summerEnd,
                },
            });

            if (!summerRule) {
                const rule = await ruleRepository.save(
                    ruleRepository.create({
                        start_date: summerStart,
                        end_date: summerEnd,
                        weekday_mask: 127, // All days
                        price_type: 'delta',
                        priority: 10,
                        tour_variant: variant,
                    }),
                );

                // Add price increases for high season (+30%)
                for (const basePaxPrice of variant.tour_variant_pax_type_prices) {
                    await rulePriceRepository.save(
                        rulePriceRepository.create({
                            price: basePaxPrice.price * 0.3, // +30%
                            tour_price_rule: rule,
                            pax_type: basePaxPrice.pax_type,
                        }),
                    );
                }
            }

            // Tet Holiday rule (Late January - Early February)
            const tetStart = new Date(`${year}-01-25`);
            const tetEnd = new Date(`${year}-02-05`);
            const tetRule = await ruleRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    start_date: tetStart,
                    end_date: tetEnd,
                },
            });

            if (!tetRule) {
                const rule = await ruleRepository.save(
                    ruleRepository.create({
                        start_date: tetStart,
                        end_date: tetEnd,
                        weekday_mask: 127, // All days
                        price_type: 'delta',
                        priority: 20, // Higher priority than summer
                        tour_variant: variant,
                    }),
                );

                // Add price increases for Tet (+50%)
                for (const basePaxPrice of variant.tour_variant_pax_type_prices) {
                    await rulePriceRepository.save(
                        rulePriceRepository.create({
                            price: basePaxPrice.price * 0.5, // +50%
                            tour_price_rule: rule,
                            pax_type: basePaxPrice.pax_type,
                        }),
                    );
                }
            }

            // Weekend surcharge (Saturday & Sunday)
            const weekendStart = new Date(`${year}-01-01`);
            const weekendEnd = new Date(`${year}-12-31`);
            const weekendRule = await ruleRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    start_date: weekendStart,
                    end_date: weekendEnd,
                    weekday_mask: 96, // Saturday (64) + Sunday (32) = 96
                },
            });

            if (!weekendRule) {
                const rule = await ruleRepository.save(
                    ruleRepository.create({
                        start_date: weekendStart,
                        end_date: weekendEnd,
                        weekday_mask: 96, // Saturday & Sunday
                        price_type: 'delta',
                        priority: 5, // Lower priority
                        tour_variant: variant,
                    }),
                );

                // Add weekend surcharge (+15%)
                for (const basePaxPrice of variant.tour_variant_pax_type_prices) {
                    await rulePriceRepository.save(
                        rulePriceRepository.create({
                            price: basePaxPrice.price * 0.15, // +15%
                            tour_price_rule: rule,
                            pax_type: basePaxPrice.pax_type,
                        }),
                    );
                }
            }

            // Low season discount (September - November, excluding weekends)
            const lowSeasonStart = new Date(`${year}-09-01`);
            const lowSeasonEnd = new Date(`${year}-11-30`);
            const lowSeasonRule = await ruleRepository.findOne({
                where: {
                    tour_variant: { id: variant.id },
                    start_date: lowSeasonStart,
                    end_date: lowSeasonEnd,
                    weekday_mask: 31, // Monday to Friday
                },
            });

            if (!lowSeasonRule) {
                const rule = await ruleRepository.save(
                    ruleRepository.create({
                        start_date: lowSeasonStart,
                        end_date: lowSeasonEnd,
                        weekday_mask: 31, // Monday to Friday (1+2+4+8+16=31)
                        price_type: 'delta',
                        priority: 3,
                        tour_variant: variant,
                    }),
                );

                // Add low season discount (-20%)
                for (const basePaxPrice of variant.tour_variant_pax_type_prices) {
                    await rulePriceRepository.save(
                        rulePriceRepository.create({
                            price: basePaxPrice.price * -0.2, // -20%
                            tour_price_rule: rule,
                            pax_type: basePaxPrice.pax_type,
                        }),
                    );
                }
            }
        }

        console.log('Tour Price Rule seeded');
    }
}

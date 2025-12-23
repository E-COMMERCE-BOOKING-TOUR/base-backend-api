import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourPolicyEntity } from '@/module/tour/entity/tourPolicy.entity';
import { TourPolicyRuleEntity } from '@/module/tour/entity/tourPolicyRule.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourStatus } from '@/module/tour/dto/tour.dto';

export default class TourPolicySeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const policyRepository = dataSource.getRepository(TourPolicyEntity);
        const policyRuleRepository =
            dataSource.getRepository(TourPolicyRuleEntity);
        const variantRepository = dataSource.getRepository(TourVariantEntity);

        const variants = await variantRepository.find({
            where: { status: 'active' },
            relations: ['tour'],
        });

        if (variants.length === 0) {
            console.log('⚠️ No variants found, skipping tour policy seeder');
            return;
        }

        for (const variant of variants) {
            if (
                (variant.tour.status as unknown as TourStatus) ===
                TourStatus.draft
            )
                continue;

            // Check if policy already exists
            const existingPolicy = await policyRepository.findOne({
                where: { tour_variant: { id: variant.id } },
            });

            if (existingPolicy) continue;

            // Create cancellation policy based on variant type
            let policyName = 'Standard Cancellation Policy';
            let rules: Array<{
                before_hours: number;
                fee_pct: number;
                sort_no: number;
            }> = [];

            if (
                variant.name.includes('VIP') ||
                variant.name.includes('Luxury')
            ) {
                policyName = 'Flexible Cancellation Policy';
                rules = [
                    { before_hours: 168, fee_pct: 0, sort_no: 1 }, // 7 days: free
                    { before_hours: 72, fee_pct: 25, sort_no: 2 }, // 3 days: 25%
                    { before_hours: 24, fee_pct: 50, sort_no: 3 }, // 1 day: 50%
                    { before_hours: 0, fee_pct: 100, sort_no: 4 }, // same day: 100%
                ];
            } else if (variant.name.includes('Private')) {
                policyName = 'Private Tour Cancellation Policy';
                rules = [
                    { before_hours: 120, fee_pct: 0, sort_no: 1 }, // 5 days: free
                    { before_hours: 72, fee_pct: 30, sort_no: 2 }, // 3 days: 30%
                    { before_hours: 48, fee_pct: 50, sort_no: 3 }, // 2 days: 50%
                    { before_hours: 24, fee_pct: 75, sort_no: 4 }, // 1 day: 75%
                    { before_hours: 0, fee_pct: 100, sort_no: 5 }, // same day: 100%
                ];
            } else if (variant.name.includes('Group')) {
                policyName = 'Group Tour Cancellation Policy';
                rules = [
                    { before_hours: 72, fee_pct: 0, sort_no: 1 }, // 3 days: free
                    { before_hours: 48, fee_pct: 50, sort_no: 2 }, // 2 days: 50%
                    { before_hours: 0, fee_pct: 100, sort_no: 3 }, // less than 2 days: 100%
                ];
            } else {
                // Standard policy
                policyName = 'Standard Cancellation Policy';
                rules = [
                    { before_hours: 72, fee_pct: 10, sort_no: 1 }, // 3 days: 10%
                    { before_hours: 48, fee_pct: 25, sort_no: 2 }, // 2 days: 25%
                    { before_hours: 24, fee_pct: 50, sort_no: 3 }, // 1 day: 50%
                    { before_hours: 0, fee_pct: 100, sort_no: 4 }, // same day: 100%
                ];
            }

            // Create policy
            const policy = await policyRepository.save(
                policyRepository.create({
                    name: policyName,
                    tour_variant: variant,
                }),
            );

            // Create policy rules
            for (const rule of rules) {
                await policyRuleRepository.save(
                    policyRuleRepository.create({
                        before_hours: rule.before_hours,
                        fee_pct: rule.fee_pct,
                        sort_no: rule.sort_no,
                        tour_policy: policy,
                    }),
                );
            }
        }

        console.log('Tour Policy seeded');
    }
}

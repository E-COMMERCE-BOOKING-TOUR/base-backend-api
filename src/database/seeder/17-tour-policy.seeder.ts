import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourPolicyEntity } from '@/module/tour/entity/tourPolicy.entity';
import { TourPolicyRuleEntity } from '@/module/tour/entity/tourPolicyRule.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';

export default class TourPolicySeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const policyRepository = dataSource.getRepository(TourPolicyEntity);
        const policyRuleRepository =
            dataSource.getRepository(TourPolicyRuleEntity);
        const supplierRepository = dataSource.getRepository(SupplierEntity);
        const variantRepository = dataSource.getRepository(TourVariantEntity);

        const suppliers = await supplierRepository.find({
            where: { status: 'active' },
        });

        if (suppliers.length === 0) {
            console.log(
                '⚠️ No active suppliers found, skipping tour policy seeder',
            );
            return;
        }

        const policyTypes = [
            {
                key: 'Standard',
                name: 'Standard Cancellation Policy',
                rules: [
                    { before_hours: 72, fee_pct: 10, sort_no: 1 },
                    { before_hours: 48, fee_pct: 25, sort_no: 2 },
                    { before_hours: 24, fee_pct: 50, sort_no: 3 },
                    { before_hours: 0, fee_pct: 100, sort_no: 4 },
                ],
            },
            {
                key: 'Flexible',
                name: 'Flexible Cancellation Policy',
                rules: [
                    { before_hours: 168, fee_pct: 0, sort_no: 1 },
                    { before_hours: 72, fee_pct: 25, sort_no: 2 },
                    { before_hours: 24, fee_pct: 50, sort_no: 3 },
                    { before_hours: 0, fee_pct: 100, sort_no: 4 },
                ],
            },
            {
                key: 'Private',
                name: 'Private Tour Cancellation Policy',
                rules: [
                    { before_hours: 120, fee_pct: 0, sort_no: 1 },
                    { before_hours: 72, fee_pct: 30, sort_no: 2 },
                    { before_hours: 48, fee_pct: 50, sort_no: 3 },
                    { before_hours: 24, fee_pct: 75, sort_no: 4 },
                    { before_hours: 0, fee_pct: 100, sort_no: 5 },
                ],
            },
            {
                key: 'Group',
                name: 'Group Tour Cancellation Policy',
                rules: [
                    { before_hours: 72, fee_pct: 0, sort_no: 1 },
                    { before_hours: 48, fee_pct: 50, sort_no: 2 },
                    { before_hours: 0, fee_pct: 100, sort_no: 3 },
                ],
            },
        ];

        // Store policies in a map for quick lookup: supplierId -> { typeKey -> PolicyEntity }
        const supplierPoliciesMap = new Map<
            number,
            Map<string, TourPolicyEntity>
        >();

        for (const supplier of suppliers) {
            const supplierMap = new Map<string, TourPolicyEntity>();
            supplierPoliciesMap.set(supplier.id, supplierMap);

            for (const type of policyTypes) {
                let policy = await policyRepository.findOne({
                    where: { name: type.name, supplier: { id: supplier.id } },
                });

                if (!policy) {
                    policy = await policyRepository.save(
                        policyRepository.create({
                            name: type.name,
                            supplier: supplier,
                        }),
                    );

                    for (const rule of type.rules) {
                        await policyRuleRepository.save(
                            policyRuleRepository.create({
                                ...rule,
                                tour_policy: policy,
                            }),
                        );
                    }
                }
                supplierMap.set(type.key, policy);
            }
        }

        console.log('✅ Created shared policies for all suppliers');

        // Link variants to policies
        const variants = await variantRepository.find({
            relations: ['tour', 'tour.supplier'],
        });

        for (const variant of variants) {
            if (!variant.tour?.supplier) continue;

            const supplierMap = supplierPoliciesMap.get(
                variant.tour.supplier.id,
            );
            if (!supplierMap) continue;

            let targetPolicy: TourPolicyEntity | undefined;

            if (
                variant.name.includes('VIP') ||
                variant.name.includes('Luxury')
            ) {
                targetPolicy = supplierMap.get('Flexible');
            } else if (variant.name.includes('Private')) {
                targetPolicy = supplierMap.get('Private');
            } else if (variant.name.includes('Group')) {
                targetPolicy = supplierMap.get('Group');
            } else {
                targetPolicy = supplierMap.get('Standard');
            }

            if (targetPolicy) {
                variant.tour_policy = targetPolicy;
                await variantRepository.save(variant);
            }
        }

        console.log('✅ Linked variants to shared policies');
    }
}

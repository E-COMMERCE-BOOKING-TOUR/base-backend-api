import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';

export default class TourVariantSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const variantRepository = dataSource.getRepository(TourVariantEntity);
        const tourRepository = dataSource.getRepository(TourEntity);
        const currencyRepository = dataSource.getRepository(CurrencyEntity);

        const tours = await tourRepository.find({ relations: ['currency'] });
        const vnd = await currencyRepository.findOne({
            where: { symbol: 'VND' },
        });
        const usd = await currencyRepository.findOne({
            where: { symbol: 'USD' },
        });

        if (tours.length === 0 || !vnd || !usd) {
            console.log(
                '⚠️ Required data not found, skipping tour variant seeder',
            );
            return;
        }

        for (const tour of tours) {
            if (tour.status === 'draft') continue;

            // Standard variant for most tours
            const standardExists = await variantRepository.findOne({
                where: { tour: { id: tour.id }, name: 'Standard' },
            });
            if (!standardExists) {
                await variantRepository.save(
                    variantRepository.create({
                        name: 'Standard',
                        sort_no: 1,
                        min_pax_per_booking: tour.min_pax,
                        capacity_per_slot: tour.max_pax,
                        tax_included: false,
                        cutoff_hours: 24,
                        status: 'active',
                        tour: tour,
                        currency: tour.currency,
                    }),
                );
            }

            // Private variant for some tours
            if (tour.max_pax && tour.max_pax >= 10) {
                const privateExists = await variantRepository.findOne({
                    where: { tour: { id: tour.id }, name: 'Private Tour' },
                });
                if (!privateExists) {
                    await variantRepository.save(
                        variantRepository.create({
                            name: 'Private Tour',
                            sort_no: 2,
                            min_pax_per_booking: 1,
                            capacity_per_slot: 8,
                            tax_included: true,
                            cutoff_hours: 48,
                            status: 'active',
                            tour: tour,
                            currency: tour.currency,
                        }),
                    );
                }
            }

            // VIP/Luxury variant for premium tours
            if (tour.slug.includes('luxury') || tour.slug.includes('cruise')) {
                const vipExists = await variantRepository.findOne({
                    where: { tour: { id: tour.id }, name: 'VIP Package' },
                });
                if (!vipExists) {
                    await variantRepository.save(
                        variantRepository.create({
                            name: 'VIP Package',
                            sort_no: 3,
                            min_pax_per_booking: 2,
                            capacity_per_slot: 20,
                            tax_included: true,
                            cutoff_hours: 72,
                            status: 'active',
                            tour: tour,
                            currency:
                                tour.currency.symbol === 'VND' ? vnd : usd,
                        }),
                    );
                }
            }

            // Group discount variant for large tours
            if (tour.max_pax && tour.max_pax >= 20) {
                const groupExists = await variantRepository.findOne({
                    where: { tour: { id: tour.id }, name: 'Group (10+ pax)' },
                });
                if (!groupExists) {
                    await variantRepository.save(
                        variantRepository.create({
                            name: 'Group (10+ pax)',
                            sort_no: 4,
                            min_pax_per_booking: 10,
                            capacity_per_slot: tour.max_pax,
                            tax_included: false,
                            cutoff_hours: 48,
                            status: 'active',
                            tour: tour,
                            currency: tour.currency,
                        }),
                    );
                }
            }
        }

        console.log('Tour Variant seeded');
    }
}

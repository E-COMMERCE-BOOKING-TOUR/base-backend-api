import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourVariantPaxTypePriceEntity } from '@/module/tour/entity/tourVariantPaxTypePrice.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

export default class TourVariantPaxPriceSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const priceRepository = dataSource.getRepository(TourVariantPaxTypePriceEntity);
        const variantRepository = dataSource.getRepository(TourVariantEntity);
        const paxTypeRepository = dataSource.getRepository(TourPaxTypeEntity);

        const variants = await variantRepository.find({ 
            relations: ['tour', 'currency'],
            where: { status: 'active' },
        });
        
        const paxTypes = await paxTypeRepository.find();

        if (variants.length === 0 || paxTypes.length === 0) {
            console.log('⚠️ Required data not found, skipping variant pax price seeder');
            return;
        }

        // Find pax types
        const infant = paxTypes.find(p => p.name === 'Infant');
        const child = paxTypes.find(p => p.name === 'Child');
        const youth = paxTypes.find(p => p.name === 'Youth');
        const adult = paxTypes.find(p => p.name === 'Adult');
        const senior = paxTypes.find(p => p.name === 'Senior');

        for (const variant of variants) {
            const isVND = variant.currency.symbol === 'VND';
            const isUSD = variant.currency.symbol === 'USD';
            
            // Base prices depending on tour type
            let basePrice = 500000; // Default VND
            if (isUSD) basePrice = 50;

            // Adjust base price by variant type
            if (variant.name.includes('Private')) {
                basePrice = basePrice * 2.5;
            } else if (variant.name.includes('VIP')) {
                basePrice = basePrice * 3;
            } else if (variant.name.includes('Group')) {
                basePrice = basePrice * 0.8;
            }

            // Adjust by tour duration
            if (variant.tour.duration_days) {
                basePrice = basePrice * variant.tour.duration_days * 1.2;
            } else if (variant.tour.duration_hours && variant.tour.duration_hours >= 8) {
                basePrice = basePrice * 1.5;
            }

            // Set prices for each pax type
            const prices = [
                { paxType: infant, multiplier: 0 },      // Infant free
                { paxType: child, multiplier: 0.5 },     // Child 50%
                { paxType: youth, multiplier: 0.75 },    // Youth 75%
                { paxType: adult, multiplier: 1 },       // Adult 100%
                { paxType: senior, multiplier: 0.85 },   // Senior 85%
            ];

            for (const { paxType, multiplier } of prices) {
                if (paxType) {
                    const exists = await priceRepository.findOne({
                        where: {
                            tour_variant: { id: variant.id },
                            pax_type: { id: paxType.id },
                        },
                    });
                    if (!exists) {
                        await priceRepository.save(
                            priceRepository.create({
                                price: basePrice * multiplier,
                                tour_variant: variant,
                                pax_type: paxType,
                            }),
                        );
                    }
                }
            }
        }

        console.log('Tour Variant Pax Price seeded');
    }
}


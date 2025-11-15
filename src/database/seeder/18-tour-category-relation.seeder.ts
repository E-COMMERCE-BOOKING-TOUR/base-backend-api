import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { TourCategoryEntity } from '@/module/tour/entity/tourCategory.entity';

export default class TourCategoryRelationSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const tourRepository = dataSource.getRepository(TourEntity);
        const categoryRepository = dataSource.getRepository(TourCategoryEntity);

        const tours = await tourRepository.find({ relations: ['tour_categories'] });
        const categories = await categoryRepository.find();

        if (tours.length === 0 || categories.length === 0) {
            console.log('⚠️ No tours or categories found, skipping relation seeder');
            return;
        }

        // Create category mappings
        const categoryMap: { [key: string]: string[] } = {
            'saigon-city-tour': ['City Tours', 'Cultural Tours', 'Historical Tours'],
            'mekong-delta-2-days': ['Cultural Tours', 'Eco Tours', 'Group Tours'],
            'cu-chi-tunnels-half-day': ['Historical Tours', 'Cultural Tours'],
            'hanoi-old-quarter-walking-tour': ['City Tours', 'Food Tours', 'Cultural Tours'],
            'halong-bay-luxury-cruise-2days': ['Cruise Tours', 'Luxury Tours', 'Adventure Tours'],
            'sapa-trekking-3-days': ['Mountain Tours', 'Adventure Tours', 'Cultural Tours', 'Eco Tours'],
            'hoi-an-ancient-town-workshop': ['Cultural Tours', 'Historical Tours', 'City Tours'],
            'ba-na-hills-golden-bridge': ['Mountain Tours', 'Adventure Tours', 'Photography Tours'],
            'marble-mountains-monkey-mountain': ['Mountain Tours', 'Cultural Tours', 'Adventure Tours'],
            'hue-imperial-city-royal-tombs': ['Historical Tours', 'Cultural Tours', 'City Tours'],
            'nha-trang-island-hopping': ['Beach & Island Tours', 'Adventure Tours', 'Group Tours'],
            'phu-quoc-3-days-beach': ['Beach & Island Tours', 'Luxury Tours', 'Family Tours'],
            'dalat-city-tour-flower-gardens': ['City Tours', 'Cultural Tours', 'Photography Tours'],
        };

        for (const tour of tours) {
            const categoryNames = categoryMap[tour.slug] || ['City Tours'];
            const tourCategories: TourCategoryEntity[] = [];

            for (const catName of categoryNames) {
                const category = categories.find(c => c.name === catName);
                if (category) {
                    tourCategories.push(category);
                }
            }

            if (tourCategories.length > 0) {
                tour.tour_categories = tourCategories;
                await tourRepository.save(tour);
            }
        }

        console.log('Tour Category Relation seeded');
    }
}


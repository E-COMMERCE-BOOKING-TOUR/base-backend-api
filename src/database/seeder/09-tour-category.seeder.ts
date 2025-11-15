import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourCategoryEntity } from '@/module/tour/entity/tourCategory.entity';

export default class TourCategorySeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(TourCategoryEntity);

        const categories = [
            { name: 'Adventure Tours', sort_no: 1 },
            { name: 'Beach & Island Tours', sort_no: 2 },
            { name: 'City Tours', sort_no: 3 },
            { name: 'Cultural Tours', sort_no: 4 },
            { name: 'Eco Tours', sort_no: 5 },
            { name: 'Food Tours', sort_no: 6 },
            { name: 'Historical Tours', sort_no: 7 },
            { name: 'Mountain Tours', sort_no: 8 },
            { name: 'Cruise Tours', sort_no: 9 },
            { name: 'Night Tours', sort_no: 10 },
            { name: 'Photography Tours', sort_no: 11 },
            { name: 'Family Tours', sort_no: 12 },
            { name: 'Luxury Tours', sort_no: 13 },
            { name: 'Budget Tours', sort_no: 14 },
            { name: 'Group Tours', sort_no: 15 },
            { name: 'Private Tours', sort_no: 16 },
        ];

        for (const category of categories) {
            const exists = await repository.findOne({ where: { name: category.name } });
            if (!exists) {
                await repository.save(repository.create(category));
            }
        }

        console.log('Tour Category seeded');
    }
}


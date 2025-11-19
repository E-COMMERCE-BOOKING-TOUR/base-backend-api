import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

export default class TourPaxTypeSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(TourPaxTypeEntity);

        const paxTypes = [
            { name: 'Infant', min_age: 0, max_age: 2 },
            { name: 'Child', min_age: 3, max_age: 11 },
            { name: 'Youth', min_age: 12, max_age: 17 },
            { name: 'Adult', min_age: 18, max_age: 59 },
            { name: 'Senior', min_age: 60, max_age: 120 },
        ];

        for (const paxType of paxTypes) {
            const exists = await repository.findOne({
                where: {
                    name: paxType.name,
                    min_age: paxType.min_age,
                    max_age: paxType.max_age,
                },
            });
            if (!exists) {
                await repository.save(repository.create(paxType));
            }
        }

        console.log('Tour Pax Type seeded');
    }
}

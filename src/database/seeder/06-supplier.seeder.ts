import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';

export default class SupplierSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(SupplierEntity);

        const suppliers = [
            {
                name: 'VietTravel Tours',
                email: 'contact@viettravel.com',
                phone: '0282123456',
                status: 'active',
            },
            {
                name: 'Saigon Tourist',
                email: 'info@saigontourist.vn',
                phone: '0283654321',
                status: 'active',
            },
            {
                name: 'Hanoi Adventure Tours',
                email: 'hello@hanoiadventure.vn',
                phone: '0243987654',
                status: 'active',
            },
            {
                name: 'Mekong Delta Travel',
                email: 'booking@mekongtravel.com',
                phone: '0292456789',
                status: 'active',
            },
            {
                name: 'Highland Explore',
                email: 'contact@highlandexplore.vn',
                phone: '0263789456',
                status: 'active',
            },
            {
                name: 'Beach Paradise Tours',
                email: 'info@beachparadise.vn',
                phone: '0258147258',
                status: 'active',
            },
            {
                name: 'Culture & Heritage Tours',
                email: 'tours@cultureheritage.vn',
                phone: '0254369852',
                status: 'active',
            },
            {
                name: 'Asia Explorer',
                email: 'booking@asiaexplorer.com',
                phone: '0281236547',
                status: 'active',
            },
            {
                name: 'Vietnam Discovery',
                email: 'info@vietnamdiscovery.vn',
                phone: '0287894561',
                status: 'inactive',
            },
            {
                name: 'Golden Tours Vietnam',
                email: 'contact@goldentours.vn',
                phone: '0289632147',
                status: 'active',
            },
        ];

        for (const supplier of suppliers) {
            const exists = await repository.findOne({
                where: { email: supplier.email },
            });
            if (!exists) {
                await repository.save(repository.create(supplier));
            }
        }

        console.log('Supplier seeded');
    }
}

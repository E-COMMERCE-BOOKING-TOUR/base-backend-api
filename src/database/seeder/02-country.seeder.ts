import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CountryEntity } from '@/common/entity/country.entity';

export default class CountrySeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(CountryEntity);

        const countries = [
            {
                name: 'Vietnam',
                iso3: 'VN',
                local_name: 'Việt Nam',
                phone_code: '+84',
            },
            {
                name: 'United States',
                iso3: 'US',
                local_name: 'United States',
                phone_code: '+1',
            },
            {
                name: 'Thailand',
                iso3: 'TH',
                local_name: 'ประเทศไทย',
                phone_code: '+66',
            },
            {
                name: 'Singapore',
                iso3: 'SG',
                local_name: 'Singapore',
                phone_code: '+65',
            },
            {
                name: 'Japan',
                iso3: 'JP',
                local_name: '日本',
                phone_code: '+81',
            },
            {
                name: 'South Korea',
                iso3: 'KR',
                local_name: '대한민국',
                phone_code: '+82',
            },
            {
                name: 'China',
                iso3: 'CN',
                local_name: '中国',
                phone_code: '+86',
            },
            {
                name: 'Malaysia',
                iso3: 'MY',
                local_name: 'Malaysia',
                phone_code: '+60',
            },
            {
                name: 'Indonesia',
                iso3: 'ID',
                local_name: 'Indonesia',
                phone_code: '+62',
            },
            {
                name: 'Philippines',
                iso3: 'PH',
                local_name: 'Philippines',
                phone_code: '+63',
            },
            {
                name: 'France',
                iso3: 'FR',
                local_name: 'France',
                phone_code: '+33',
            },
            {
                name: 'United Kingdom',
                iso3: 'GB',
                local_name: 'United Kingdom',
                phone_code: '+44',
            },
            {
                name: 'Australia',
                iso3: 'AU',
                local_name: 'Australia',
                phone_code: '+61',
            },
            {
                name: 'Cambodia',
                iso3: 'KH',
                local_name: 'កម្ពុជា',
                phone_code: '+855',
            },
            { name: 'Laos', iso3: 'LA', local_name: 'ລາວ', phone_code: '+856' },
        ];

        for (const country of countries) {
            const exists = await repository.findOne({
                where: { iso3: country.iso3 },
            });
            if (!exists) {
                await repository.save(repository.create(country));
            }
        }

        console.log('Country seeded');
    }
}

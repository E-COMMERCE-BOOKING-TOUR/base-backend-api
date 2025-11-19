import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CurrencyEntity } from '@/common/entity/currency.entity';

export default class CurrencySeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(CurrencyEntity);

        const currencies = [
            { name: 'Vietnamese Dong', symbol: 'VND' },
            { name: 'US Dollar', symbol: 'USD' },
            { name: 'Euro', symbol: 'EUR' },
            { name: 'Thai Baht', symbol: 'THB' },
            { name: 'Singapore Dollar', symbol: 'SGD' },
            { name: 'Japanese Yen', symbol: 'JPY' },
            { name: 'South Korean Won', symbol: 'KRW' },
            { name: 'Chinese Yuan', symbol: 'CNY' },
            { name: 'Malaysian Ringgit', symbol: 'MYR' },
            { name: 'British Pound', symbol: 'GBP' },
        ];

        for (const currency of currencies) {
            const exists = await repository.findOne({
                where: { symbol: currency.symbol },
            });
            if (!exists) {
                await repository.save(repository.create(currency));
            }
        }

        console.log('Currency seeded');
    }
}

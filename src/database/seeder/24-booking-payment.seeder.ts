import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BookingPaymentEntity } from '@/module/booking/entity/bookingPayment.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';

export default class BookingPaymentSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const paymentRepository =
            dataSource.getRepository(BookingPaymentEntity);
        const currencyRepository = dataSource.getRepository(CurrencyEntity);

        const vnd = await currencyRepository.findOne({
            where: { symbol: 'VND' },
        });
        const usd = await currencyRepository.findOne({
            where: { symbol: 'USD' },
        });

        if (!vnd || !usd) {
            console.log(
                '⚠️ Currencies not found, skipping booking payment seeder',
            );
            return;
        }

        const paymentMethods = [
            {
                payment_method_name: 'Credit/Debit Card',
                rule_min: 0,
                rule_max: 999999999,
                status: 'active',
                currency: vnd,
            },
            {
                payment_method_name: 'International Card (USD)',
                rule_min: 0,
                rule_max: 100000,
                status: 'active',
                currency: usd,
            },
            {
                payment_method_name: 'Bank Transfer',
                rule_min: 500000,
                rule_max: 999999999,
                status: 'active',
                currency: vnd,
            },
            {
                payment_method_name: 'VNPay E-wallet',
                rule_min: 10000,
                rule_max: 50000000,
                status: 'active',
                currency: vnd,
            },
            {
                payment_method_name: 'MoMo E-wallet',
                rule_min: 10000,
                rule_max: 50000000,
                status: 'active',
                currency: vnd,
            },
            {
                payment_method_name: 'ZaloPay',
                rule_min: 10000,
                rule_max: 20000000,
                status: 'active',
                currency: vnd,
            },
            {
                payment_method_name: 'PayPal',
                rule_min: 1,
                rule_max: 10000,
                status: 'active',
                currency: usd,
            },
            {
                payment_method_name: 'Cash Payment',
                rule_min: 0,
                rule_max: 10000000,
                status: 'inactive',
                currency: vnd,
            },
        ];

        for (const method of paymentMethods) {
            const exists = await paymentRepository.findOne({
                where: { payment_method_name: method.payment_method_name },
            });
            if (!exists) {
                await paymentRepository.save(paymentRepository.create(method));
            }
        }

        console.log('Booking Payment seeded');
    }
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { UserEntity } from '@/module/user/entity/user.entity';

export default class PaymentInformationSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const paymentRepository = dataSource.getRepository(
            PaymentInfomationEntity,
        );
        const userRepository = dataSource.getRepository(UserEntity);

        // Get customer users
        const customers = await userRepository.find({
            where: { role: { name: 'customer' } },
            take: 8,
        });

        if (customers.length === 0) {
            console.log(
                '⚠️ No customers found, skipping payment information seeder',
            );
            return;
        }

        const paymentInfos = [
            // Customer 1 - multiple cards
            {
                user: customers[0],
                is_default: true,
                expiry_date: '12/2025',
                account_number: 'encrypted_4532123456789012',
                account_number_hint: '**** **** **** 9012',
                account_holder: customers[0]?.full_name || 'Customer 1',
                ccv: 'encrypted_123',
            },
            {
                user: customers[0],
                is_default: false,
                expiry_date: '06/2026',
                account_number: 'encrypted_5412345678901234',
                account_number_hint: '**** **** **** 1234',
                account_holder: customers[0]?.full_name || 'Customer 1',
                ccv: 'encrypted_456',
            },
            // Customer 2
            {
                user: customers[1],
                is_default: true,
                expiry_date: '09/2025',
                account_number: 'encrypted_4716234567890123',
                account_number_hint: '**** **** **** 0123',
                account_holder: customers[1]?.full_name || 'Customer 2',
                ccv: 'encrypted_789',
            },
            // Customer 3
            {
                user: customers[2],
                is_default: true,
                expiry_date: '03/2026',
                account_number: 'encrypted_4024007156789012',
                account_number_hint: '**** **** **** 9012',
                account_holder: customers[2]?.full_name || 'Customer 3',
                ccv: 'encrypted_321',
            },
            // Customer 4
            {
                user: customers[3],
                is_default: true,
                expiry_date: '11/2025',
                account_number: 'encrypted_3782822463100053',
                account_number_hint: '**** ****** *0053',
                account_holder: customers[3]?.full_name || 'Customer 4',
                ccv: 'encrypted_654',
            },
            // Customer 5
            {
                user: customers[4],
                is_default: true,
                expiry_date: '08/2026',
                account_number: 'encrypted_6011123456789012',
                account_number_hint: '**** **** **** 9012',
                account_holder: customers[4]?.full_name || 'Customer 5',
                ccv: 'encrypted_987',
            },
            // Customer 6 - multiple cards
            {
                user: customers[5],
                is_default: true,
                expiry_date: '07/2025',
                account_number: 'encrypted_5555555555554444',
                account_number_hint: '**** **** **** 4444',
                account_holder: customers[5]?.full_name || 'Customer 6',
                ccv: 'encrypted_111',
            },
            {
                user: customers[5],
                is_default: false,
                expiry_date: '12/2026',
                account_number: 'encrypted_4111111111111111',
                account_number_hint: '**** **** **** 1111',
                account_holder: customers[5]?.full_name || 'Customer 6',
                ccv: 'encrypted_222',
            },
            // Customer 7
            {
                user: customers[6],
                is_default: true,
                expiry_date: '05/2026',
                account_number: 'encrypted_3056930009020004',
                account_number_hint: '**** ****** *0004',
                account_holder: customers[6]?.full_name || 'Customer 7',
                ccv: 'encrypted_333',
            },
            // Customer 8 (International)
            {
                user: customers[7],
                is_default: true,
                expiry_date: '10/2026',
                account_number: 'encrypted_4532123456789000',
                account_number_hint: '**** **** **** 9000',
                account_holder: customers[7]?.full_name || 'John Smith',
                ccv: 'encrypted_444',
            },
        ];

        for (const paymentInfo of paymentInfos) {
            if (paymentInfo.user) {
                const exists = await paymentRepository.findOne({
                    where: {
                        user: { id: paymentInfo.user.id },
                        account_number_hint: paymentInfo.account_number_hint,
                    },
                });
                if (!exists) {
                    await paymentRepository.save(
                        paymentRepository.create(paymentInfo),
                    );
                }
            }
        }

        console.log('Payment Information seeded');
    }
}

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
                'No customers found, skipping payment information seeder',
            );
            return;
        }

        const paymentInfos = [
            // Customer 1 - Visa
            {
                user: customers[0],
                brand: 'Visa',
                funding: 'credit',
                country: 'VN',
                account_holder: customers[0]?.full_name || 'Customer 1',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_1',
                fingerprint: 'fp_1234567890abcdef',
                expiry_date: '12/25',
                last4: '4242',
            },
            // Customer 1 - Mastercard (secondary)
            {
                user: customers[0],
                brand: 'Mastercard',
                funding: 'credit',
                country: 'VN',
                account_holder: customers[0]?.full_name || 'Customer 1',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_1b',
                fingerprint: 'fp_abcdef1234567890',
                expiry_date: '06/26',
                last4: '5555',
            },
            // Customer 2 - Visa
            {
                user: customers[1],
                brand: 'Visa',
                funding: 'debit',
                country: 'VN',
                account_holder: customers[1]?.full_name || 'Customer 2',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_2',
                fingerprint: 'fp_2222222222222222',
                expiry_date: '09/25',
                last4: '1234',
            },
            // Customer 3 - Mastercard
            {
                user: customers[2],
                brand: 'Mastercard',
                funding: 'credit',
                country: 'VN',
                account_holder: customers[2]?.full_name || 'Customer 3',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_3',
                fingerprint: 'fp_3333333333333333',
                expiry_date: '03/26',
                last4: '8888',
            },
            // Customer 4 - American Express
            {
                user: customers[3],
                brand: 'American Express',
                funding: 'credit',
                country: 'US',
                account_holder: customers[3]?.full_name || 'Customer 4',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_4',
                fingerprint: 'fp_4444444444444444',
                expiry_date: '11/25',
                last4: '0005',
            },
            // Customer 5 - Discover
            {
                user: customers[4],
                brand: 'Discover',
                funding: 'credit',
                country: 'US',
                account_holder: customers[4]?.full_name || 'Customer 5',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_5',
                fingerprint: 'fp_5555555555555555',
                expiry_date: '08/26',
                last4: '9012',
            },
            // Customer 6 - Visa
            {
                user: customers[5],
                brand: 'Visa',
                funding: 'prepaid',
                country: 'VN',
                account_holder: customers[5]?.full_name || 'Customer 6',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_6',
                fingerprint: 'fp_6666666666666666',
                expiry_date: '07/25',
                last4: '4444',
            },
            // Customer 7 - Diners Club
            {
                user: customers[6],
                brand: 'Diners Club',
                funding: 'credit',
                country: 'JP',
                account_holder: customers[6]?.full_name || 'Customer 7',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_7',
                fingerprint: 'fp_7777777777777777',
                expiry_date: '05/26',
                last4: '0004',
            },
            // Customer 8 - JCB (International)
            {
                user: customers[7],
                brand: 'JCB',
                funding: 'credit',
                country: 'JP',
                account_holder: customers[7]?.full_name || 'John Smith',
                cvc_check: 'pass',
                customer_id: 'cus_test_customer_8',
                fingerprint: 'fp_8888888888888888',
                expiry_date: '10/26',
                last4: '0000',
            },
        ];

        for (const paymentInfo of paymentInfos) {
            if (paymentInfo.user) {
                const exists = await paymentRepository.findOne({
                    where: {
                        user: { id: paymentInfo.user.id },
                        last4: paymentInfo.last4,
                        customer_id: paymentInfo.customer_id,
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

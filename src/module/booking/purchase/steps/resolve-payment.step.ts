import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { BookingPaymentEntity } from '../../entity/bookingPayment.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class ResolvePaymentStep implements PurchaseStep {
    priority = 50;

    constructor(
        @InjectRepository(PaymentInfomationEntity)
        private readonly paymentInfoRepository: Repository<PaymentInfomationEntity>,
        @InjectRepository(BookingPaymentEntity)
        private readonly bookingPaymentRepository: Repository<BookingPaymentEntity>,
        @InjectRepository(CurrencyEntity)
        private readonly currencyRepository: Repository<CurrencyEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.user) {
            throw new Error('User must be resolved before resolving payment');
        }

        // Find or create payment info
        let paymentInfo = await this.paymentInfoRepository.findOne({
            where: { user: { id: ctx.user.id } },
        });

        if (!paymentInfo) {
            paymentInfo = this.paymentInfoRepository.create({
                user: ctx.user,
                is_default: true,
                expiry_date: '12/30',
                account_number: 'xxxx',
                account_number_hint: '1234',
                account_holder: ctx.user.full_name,
                ccv: 'xxx',
            });
            await this.paymentInfoRepository.save(paymentInfo);
        }

        // Find or create booking payment
        let bookingPayment = await this.bookingPaymentRepository.findOne({
            where: { status: 'active' },
            relations: ['currency'],
        });

        if (!bookingPayment) {
            const currency =
                (await this.currencyRepository.findOne({
                    where: { name: 'VND' },
                })) ||
                (await this.currencyRepository.save(
                    this.currencyRepository.create({
                        name: 'VND',
                        symbol: 'đ',
                    }),
                ));

            bookingPayment = this.bookingPaymentRepository.create({
                payment_method_name: 'Credit Card',
                status: 'active',
                currency,
                rule_min: 0,
                rule_max: 1000000000,
            });
            await this.bookingPaymentRepository.save(bookingPayment);
        }

        return {
            ...ctx,
            paymentInfo,
            bookingPayment,
        };
    }
}


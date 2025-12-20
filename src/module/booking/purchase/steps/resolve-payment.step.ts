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
    ) { }

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        if (!ctx.user) {
            throw new Error('User must be resolved before resolving payment');
        }

        // We do NOT automatically assign payment info or booking payment here anymore.
        // These will be selected/created by the user during the checkout steps.

        return {
            ...ctx,
            paymentInfo: undefined,
            bookingPayment: undefined,
        };
    }
}

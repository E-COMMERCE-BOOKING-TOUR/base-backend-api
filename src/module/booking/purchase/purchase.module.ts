import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { BookingPaymentEntity } from '../entity/bookingPayment.entity';
import { BookingItemEntity } from '../entity/bookingItem.entity';
import { BookingEntity } from '../entity/booking.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { PurchaseStep } from './types/index.interface';
import { ValidateUserStep } from './steps/validate-user.step';
import { ValidateVariantStep } from './steps/validate-variant.step';
import { ResolveSessionStep } from './steps/resolve-session.step';
import { CreateInventoryHoldStep } from './steps/create-inventory-hold.step';
import { ResolvePaymentStep } from './steps/resolve-payment.step';
import { CalculatePriceStep } from './steps/calculate-price.step';
import { CreateBookingItemsStep } from './steps/create-booking-items.step';
import { CreateBookingStep } from './steps/create-booking.step';
import { PurchaseService } from './purchase.service';
import { PricingModule } from '@/module/pricing/pricing.module';
import { TourModule } from '@/module/tour/tour.module';

@Module({})
export class PurchaseModule {
    static forRoot(extraSteps: Array<new (...args: unknown[]) => PurchaseStep> = []): DynamicModule {
        const defaultSteps = [
            ValidateUserStep,
            ValidateVariantStep,
            ResolveSessionStep,
            CreateInventoryHoldStep,
            ResolvePaymentStep,
            CalculatePriceStep,
            CreateBookingItemsStep,
            CreateBookingStep,
        ];
        const stepProviders = [...defaultSteps, ...extraSteps];

        return {
            module: PurchaseModule,
            imports: [
                TypeOrmModule.forFeature([
                    UserEntity,
                    TourVariantEntity,
                    TourEntity,
                    TourSessionEntity,
                    TourInventoryHoldEntity,
                    PaymentInfomationEntity,
                    BookingPaymentEntity,
                    BookingItemEntity,
                    BookingEntity,
                    CurrencyEntity,
                    TourPaxTypeEntity,
                ]),
                PricingModule.forRoot([]),
                TourModule,
            ],
            providers: [
                ...stepProviders,
                {
                    provide: 'PURCHASE_STEPS',
                    useFactory: (...steps: PurchaseStep[]) => {
                        return steps.sort(
                            (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
                        );
                    },
                    inject: stepProviders,
                },
                PurchaseService,
            ],
            exports: [PurchaseService],
        };
    }
}


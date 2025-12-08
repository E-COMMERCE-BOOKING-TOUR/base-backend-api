import { DynamicModule, Module, Type } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { BasePriceStep } from './steps/base-price.step';
import { TaxStep } from './steps/tax-price.step';
import { PriceStep } from './types/index.interface';

/**
 * Dynamic pricing module that wires a pipeline of pricing steps.
 * Steps are ordered by `priority` so each layer stays isolated and easy to swap.
 */
@Module({})
export class PricingModule {
    static forRoot(
        extraSteps: Type[] = [],
    ): DynamicModule {
        const defaultSteps = [BasePriceStep, TaxStep];
        const stepProviders = [...defaultSteps, ...extraSteps];
        const injectTokens = stepProviders;

        return {
            module: PricingModule,
            providers: [
                ...stepProviders,
                {
                    provide: 'PRICE_STEPS',
                    useFactory: (...steps: PriceStep[]) =>
                        steps.sort(
                            (a, b) =>
                                (a.priority ?? 100) - (b.priority ?? 100),
                        ),
                    inject: injectTokens,
                },
                PricingService,
            ],
            exports: [PricingService],
        };
    }
}


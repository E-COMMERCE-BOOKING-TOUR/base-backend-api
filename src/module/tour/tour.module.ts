import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from './entity/tour.entity';
import { TourImageEntity } from './entity/tourImage.entity';
import { TourVariantEntity } from './entity/tourVariant.entity';
import { TourSessionEntity } from './entity/tourSession.entity';
import { TourPolicyEntity } from './entity/tourPolicy.entity';
import { TourPolicyRuleEntity } from './entity/tourPolicyRule.entity';
import { TourPriceRuleEntity } from './entity/tourPriceRule.entity';
import { TourRulePaxTypePriceEntity } from './entity/tourRulePaxTypePrice.entity';
import { TourVariantPaxTypePriceEntity } from './entity/tourVariantPaxTypePrice.entity';
import { TourPaxTypeEntity } from './entity/tourPaxType.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import { TourCategoryEntity } from './entity/tourCategory.entity';
import { TourService } from './service/tour.service';
import { AdminTourController } from './controller/admin-tour.controller';
import { UserTourService } from './service/user-tour.service';
import { UserTourController } from './controller/user-tour.controller';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { PricingModule } from '../pricing/pricing.module';
import { TourBasePriceStep } from '../pricing/steps/tour-base-price.step';
import { TourRulePriceStep } from '../pricing/steps/tour-rule-price.step';
import { TourAssemblePriceStep } from '../pricing/steps/tour-assemble-price.step';
import { AdminTourService } from './service/admin-tour.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TourEntity,
            TourImageEntity,
            TourVariantEntity,
            TourSessionEntity,
            TourPolicyEntity,
            TourPolicyRuleEntity,
            TourPriceRuleEntity,
            TourRulePaxTypePriceEntity,
            TourVariantPaxTypePriceEntity,
            TourPaxTypeEntity,
            CurrencyEntity,
            CountryEntity,
            DivisionEntity,
            SupplierEntity,
            TourCategoryEntity,
            ReviewEntity,
        ]),
        PricingModule.forRoot([
            TourBasePriceStep,
            TourRulePriceStep,
            TourAssemblePriceStep,
        ]),
        CloudinaryModule,
    ],
    controllers: [AdminTourController, UserTourController],
    providers: [TourService, UserTourService, AdminTourService],
    exports: [TourService, UserTourService, AdminTourService],
})
export class TourModule { }

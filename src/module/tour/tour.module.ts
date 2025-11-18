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
import { TourController } from './controller/tour.controller';
import { UserTourService } from './service/userTour.service';
import { UserTourController } from './controller/userTour.controller';
import { ReviewEntity } from '@/module/review/entity/review.entity';

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
    ],
    controllers: [TourController, UserTourController],
    providers: [TourService, UserTourService],
    exports: [TourService, UserTourService],
})
export class TourModule {}

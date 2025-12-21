import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { TourEntity } from '../entity/tour.entity';
import { TourImageEntity } from '../entity/tourImage.entity';
import { TourVariantEntity } from '../entity/tourVariant.entity';
import { TourSessionEntity } from '../entity/tourSession.entity';
import { TourPolicyEntity } from '../entity/tourPolicy.entity';
import { TourPolicyRuleEntity } from '../entity/tourPolicyRule.entity';
import { TourPriceRuleEntity } from '../entity/tourPriceRule.entity';
import { TourRulePaxTypePriceEntity } from '../entity/tourRulePaxTypePrice.entity';
import { TourVariantPaxTypePriceEntity } from '../entity/tourVariantPaxTypePrice.entity';
import { TourPaxTypeEntity } from '../entity/tourPaxType.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import {
    TourDTO,
    TourImageDTO,
    TourVariantDTO,
    TourSessionDTO,
    TourPolicyDTO,
    TourPolicyRuleDTO,
    TourPriceRuleDTO,
    TourRulePaxTypePriceDTO,
    TourVariantPaxTypePriceDTO,
    TourSummaryDTO,
    TourDetailDTO,
    TourImageDetailDTO,
    TourVariantSummaryDTO,
    TourStatus,
    TourVariantStatus,
} from '../dto/tour.dto';
import { TourCategoryEntity } from '../entity/tourCategory.entity';

export class TourService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(TourImageEntity)
        private readonly imageRepository: Repository<TourImageEntity>,
        @InjectRepository(TourVariantEntity)
        private readonly variantRepository: Repository<TourVariantEntity>,
        @InjectRepository(TourSessionEntity)
        private readonly sessionRepository: Repository<TourSessionEntity>,
        @InjectRepository(TourPolicyEntity)
        private readonly policyRepository: Repository<TourPolicyEntity>,
        @InjectRepository(TourPolicyRuleEntity)
        private readonly policyRuleRepository: Repository<TourPolicyRuleEntity>,
        @InjectRepository(TourPriceRuleEntity)
        private readonly priceRuleRepository: Repository<TourPriceRuleEntity>,
        @InjectRepository(TourRulePaxTypePriceEntity)
        private readonly rulePaxPriceRepository: Repository<TourRulePaxTypePriceEntity>,
        @InjectRepository(TourVariantPaxTypePriceEntity)
        private readonly variantPaxPriceRepository: Repository<TourVariantPaxTypePriceEntity>,
        @InjectRepository(TourPaxTypeEntity)
        private readonly paxTypeRepository: Repository<TourPaxTypeEntity>,
        @InjectRepository(CurrencyEntity)
        private readonly currencyRepository: Repository<CurrencyEntity>,
        @InjectRepository(CountryEntity)
        private readonly countryRepository: Repository<CountryEntity>,
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: Repository<DivisionEntity>,
        @InjectRepository(SupplierEntity)
        private readonly supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(TourCategoryEntity)
        private readonly categoryRepository: Repository<TourCategoryEntity>,
    ) { }
}

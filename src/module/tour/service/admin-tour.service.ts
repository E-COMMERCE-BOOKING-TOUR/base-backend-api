import { Injectable, NotFoundException } from '@nestjs/common';
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
import { TourCategoryEntity } from '../entity/tourCategory.entity';
import {
    TourDTO,
    TourImageDTO,
    TourVariantDTO,
    TourSessionDTO,
    TourPolicyDTO,
    TourPriceRuleDTO,
    TourVariantPaxTypePriceDTO,
    TourStatus,
    TourVariantStatus,
    TourImageDetailDTO,
    TourVariantSummaryDTO,
    TourDetailDTO,
} from '../dto/tour.dto';

@Injectable()
export class AdminTourService {
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

    async getAllTours(): Promise<TourEntity[]> {
        return this.tourRepository.find({
            relations: ['country', 'division', 'currency', 'supplier', 'tour_categories', 'images'],
            order: { created_at: 'DESC' },
        });
    }

    async getCountries(): Promise<CountryEntity[]> {
        return this.countryRepository.find({ order: { name: 'ASC' } });
    }

    async getDivisionsByCountry(countryId: number): Promise<DivisionEntity[]> {
        return this.divisionRepository.find({
            where: { country: { id: countryId } },
            order: { name_local: 'ASC' }
        });
    }

    async getCurrencies(): Promise<CurrencyEntity[]> {
        return this.currencyRepository.find({ order: { name: 'ASC' } });
    }

    async getTourById(id: number): Promise<TourEntity> {
        const tour = await this.tourRepository.findOne({
            where: { id },
            relations: [
                'country',
                'division',
                'currency',
                'supplier',
                'images',
                'variants',
                'tour_categories',
                'variants.tour_sessions',
                'variants.tour_variant_pax_type_prices',
                'variants.tour_variant_pax_type_prices.pax_type',
            ],
        });
        if (!tour) throw new NotFoundException(`Tour with ID ${id} not found`);
        return tour;
    }

    async createTour(dto: TourDTO): Promise<TourEntity> {
        const { tour_category_ids, images, ...rest } = dto;

        const categories = tour_category_ids?.length
            ? await this.categoryRepository.find({ where: { id: In(tour_category_ids) } })
            : [];

        const tour = this.tourRepository.create({
            ...rest,
            country: { id: dto.country_id },
            division: { id: dto.division_id },
            currency: { id: dto.currency_id },
            supplier: { id: dto.supplier_id },
            tour_categories: categories,
        } as DeepPartial<TourEntity>);

        const savedTour = await this.tourRepository.save(tour);

        if (images?.length) {
            const imageEntities = images.map(img => this.imageRepository.create({
                ...img,
                tour: savedTour,
            }));
            await this.imageRepository.save(imageEntities);
        }

        return this.getTourById(savedTour.id);
    }

    async updateTour(id: number, dto: Partial<TourDTO>): Promise<TourEntity> {
        const tour = await this.getTourById(id);
        const { tour_category_ids, images, ...rest } = dto;

        if (tour_category_ids) {
            tour.tour_categories = await this.categoryRepository.find({ where: { id: In(tour_category_ids) } });
        }

        Object.assign(tour, rest);
        if (dto.country_id) tour.country = { id: dto.country_id } as CountryEntity;
        if (dto.division_id) tour.division = { id: dto.division_id } as DivisionEntity;
        if (dto.currency_id) tour.currency = { id: dto.currency_id } as CurrencyEntity;
        if (dto.supplier_id) tour.supplier = { id: dto.supplier_id } as SupplierEntity;

        await this.tourRepository.save(tour);

        if (images) {
            // Simple replace strategy for images in this demo
            await this.imageRepository.delete({ tour: { id } });
            const imageEntities = images.map(img => this.imageRepository.create({
                ...img,
                tour,
            }));
            await this.imageRepository.save(imageEntities);
        }

        return this.getTourById(id);
    }

    async removeTour(id: number): Promise<void> {
        await this.tourRepository.softDelete(id);
    }

    // --- Variant Management ---

    async addVariant(tourId: number, dto: TourVariantDTO): Promise<TourVariantEntity> {
        const variant = this.variantRepository.create({
            ...dto,
            tour: { id: tourId },
            currency: { id: dto.currency_id },
        } as DeepPartial<TourVariantEntity>);
        return this.variantRepository.save(variant);
    }

    async updateVariant(id: number, dto: Partial<TourVariantDTO>): Promise<TourVariantEntity> {
        const variant = await this.variantRepository.findOne({ where: { id } });
        if (!variant) throw new NotFoundException(`Variant ${id} not found`);
        Object.assign(variant, dto);
        if (dto.currency_id) variant.currency = { id: dto.currency_id } as CurrencyEntity;
        return this.variantRepository.save(variant);
    }

    async removeVariant(id: number): Promise<void> {
        await this.variantRepository.delete(id);
    }

    // --- Pricing Management ---

    async setVariantPaxTypePrice(dto: TourVariantPaxTypePriceDTO): Promise<void> {
        const { tour_variant_id, pax_type_id, price } = dto;
        let entity = await this.variantPaxPriceRepository.findOne({
            where: { tour_variant: { id: tour_variant_id }, pax_type: { id: pax_type_id } }
        });

        if (entity) {
            entity.price = price;
        } else {
            entity = this.variantPaxPriceRepository.create({
                tour_variant: { id: tour_variant_id },
                pax_type: { id: pax_type_id },
                price
            });
        }
        await this.variantPaxPriceRepository.save(entity);
    }

    // --- Session Management ---

    async addSession(dto: TourSessionDTO): Promise<TourSessionEntity> {
        const session = this.sessionRepository.create({
            ...dto,
            tour_variant: { id: dto.tour_variant_id },
            session_date: new Date(dto.session_date),
            start_time: dto.start_time ? `1970-01-01 ${dto.start_time}` : null,
            end_time: dto.end_time ? `1970-01-01 ${dto.end_time}` : null,
        } as DeepPartial<TourSessionEntity>);
        return this.sessionRepository.save(session);
    }

    async bulkAddSessions(dto: TourSessionDTO[]): Promise<TourSessionEntity[]> {
        const sessions = dto.map(s => this.sessionRepository.create({
            ...s,
            tour_variant: { id: s.tour_variant_id },
            session_date: new Date(s.session_date),
            start_time: s.start_time ? `1970-01-01 ${s.start_time}` : null,
            end_time: s.end_time ? `1970-01-01 ${s.end_time}` : null,
        } as DeepPartial<TourSessionEntity>));
        return this.sessionRepository.save(sessions);
    }

    async removeSession(id: number): Promise<void> {
        await this.sessionRepository.delete(id);
    }
}

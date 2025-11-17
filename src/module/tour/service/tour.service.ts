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
    ) {}

    async getAllTours(): Promise<TourSummaryDTO[]> {
        const tours = await this.tourRepository.find({
            relations: ['currency', 'supplier'],
            order: { created_at: 'DESC' },
        });
        return tours.map(
            (t) =>
                new TourSummaryDTO({
                    id: t.id,
                    title: t.title,
                    status: (t.status as TourStatus) ?? TourStatus.inactive,
                    is_visible: !!t.is_visible,
                    score_rating: t.score_rating ?? 0,
                    tax: t.tax ?? 0,
                    min_pax: t.min_pax,
                    max_pax: t.max_pax ?? undefined,
                    currency_id: t.currency?.id,
                    supplier_id: t.supplier?.id,
                }),
        );
    }

    async getToursBySupplier(supplierId: number): Promise<TourSummaryDTO[]> {
        const tours = await this.tourRepository.find({
            where: { supplier: { id: supplierId } },
            relations: ['currency', 'supplier'],
            order: { created_at: 'DESC' },
        });
        return tours.map(
            (t) =>
                new TourSummaryDTO({
                    id: t.id,
                    title: t.title,
                    status: (t.status as TourStatus) ?? TourStatus.inactive,
                    is_visible: !!t.is_visible,
                    score_rating: t.score_rating ?? 0,
                    tax: t.tax ?? 0,
                    min_pax: t.min_pax,
                    max_pax: t.max_pax ?? undefined,
                    currency_id: t.currency?.id,
                    supplier_id: t.supplier?.id,
                }),
        );
    }

    async getTourById(id: number): Promise<TourDetailDTO | null> {
        const t = await this.tourRepository.findOne({
            where: { id },
            relations: [
                'country',
                'division',
                'currency',
                'supplier',
                'images',
                'variants',
                'tour_categories',
            ],
        });
        if (!t) return null;
        return new TourDetailDTO({
            id: t.id,
            title: t.title,
            status: (t.status as TourStatus) ?? TourStatus.inactive,
            is_visible: !!t.is_visible,
            score_rating: t.score_rating ?? 0,
            tax: t.tax ?? 0,
            min_pax: t.min_pax,
            max_pax: t.max_pax ?? undefined,
            currency_id: t.currency?.id,
            supplier_id: t.supplier?.id,
            description: t.description,
            summary: t.summary,
            map_url: t.map_url ?? undefined,
            slug: t.slug,
            address: t.address,
            country_id: t.country?.id,
            division_id: t.division?.id,
            tour_category_ids: (t.tour_categories ?? []).map((c) => c.id),
            images: (t.images ?? []).map(
                (img) =>
                    new TourImageDetailDTO({
                        id: img.id,
                        image_url: img.image_url,
                        sort_no: img.sort_no ?? undefined,
                        is_cover: !!img.is_cover,
                    }),
            ),
            variants: (t.variants ?? []).map(
                (v) =>
                    new TourVariantSummaryDTO({
                        id: v.id,
                        name: v.name,
                        status: v.status as TourVariantStatus,
                    }),
            ),
        });
    }

    async createTour(dto: TourDTO): Promise<TourDetailDTO> {
        const country = await this.countryRepository.findOne({
            where: { id: dto.country_id },
        });
        const division = await this.divisionRepository.findOne({
            where: { id: dto.division_id },
        });
        const currency = await this.currencyRepository.findOne({
            where: { id: dto.currency_id },
        });
        const supplier = await this.supplierRepository.findOne({
            where: { id: dto.supplier_id },
        });
        const categories = dto.tour_category_ids?.length
            ? await this.categoryRepository.find({
                  where: { id: In(dto.tour_category_ids) },
              })
            : [];
        const tour = await this.tourRepository.save(
            this.tourRepository.create({
                title: dto.title,
                description: dto.description,
                summary: dto.summary,
                map_url: dto.map_url ?? null,
                slug: dto.slug,
                address: dto.address,
                tax: dto.tax,
                is_visible: dto.is_visible ?? false,
                published_at: dto.published_at
                    ? new Date(dto.published_at)
                    : null,
                status: (dto.status ?? TourStatus.inactive) as string,
                duration_hours: dto.duration_hours ?? null,
                duration_days: dto.duration_days ?? null,
                min_pax: dto.min_pax,
                max_pax: dto.max_pax ?? null,
                country,
                division,
                currency,
                supplier,
                tour_categories: categories,
            } as DeepPartial<TourEntity>),
        );
        if (dto.images?.length) {
            const imageEntities = dto.images.map((i: TourImageDTO) =>
                this.imageRepository.create({
                    image_url: i.image_url,
                    sort_no: i.sort_no ?? 0,
                    is_cover: i.is_cover ?? false,
                    tour,
                }),
            );
            await this.imageRepository.save(imageEntities);
        }
        return (await this.getTourById(tour.id)) as TourDetailDTO;
    }

    async updateTour(
        id: number,
        dto: Partial<TourDTO>,
    ): Promise<TourDetailDTO | null> {
        const tour = await this.tourRepository.findOne({
            where: { id },
            relations: ['tour_categories'],
        });
        if (!tour) return null;
        tour.title = dto.title ?? tour.title;
        tour.description = dto.description ?? tour.description;
        tour.summary = dto.summary ?? tour.summary;
        tour.map_url = dto.map_url ?? tour.map_url;
        tour.slug = dto.slug ?? tour.slug;
        tour.address = dto.address ?? tour.address;
        tour.tax = dto.tax ?? tour.tax;
        tour.is_visible = dto.is_visible ?? tour.is_visible;
        tour.published_at = dto.published_at
            ? new Date(dto.published_at)
            : tour.published_at;
        tour.status = dto.status ?? tour.status;
        tour.duration_hours = dto.duration_hours ?? tour.duration_hours;
        tour.duration_days = dto.duration_days ?? tour.duration_days;
        tour.min_pax = dto.min_pax ?? tour.min_pax;
        tour.max_pax = dto.max_pax ?? tour.max_pax;
        if (dto.country_id)
            tour.country = { id: dto.country_id } as CountryEntity;
        if (dto.division_id)
            tour.division = { id: dto.division_id } as DivisionEntity;
        if (dto.currency_id)
            tour.currency = { id: dto.currency_id } as CurrencyEntity;
        if (dto.supplier_id)
            tour.supplier = { id: dto.supplier_id } as SupplierEntity;
        if (dto.tour_category_ids) {
            const categories = await this.categoryRepository.find({
                where: { id: In(dto.tour_category_ids) },
            });
            tour.tour_categories = categories;
        }
        await this.tourRepository.save(tour);
        return this.getTourById(id);
    }

    async removeTour(id: number): Promise<boolean> {
        const res = await this.tourRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async addImages(
        tourId: number,
        images: TourImageDTO[],
    ): Promise<TourImageDetailDTO[]> {
        const tour = await this.tourRepository.findOne({
            where: { id: tourId },
        });
        if (!tour) return [];
        const entities = images.map((i) =>
            this.imageRepository.create({
                image_url: i.image_url,
                sort_no: i.sort_no ?? 0,
                is_cover: i.is_cover ?? false,
                tour,
            }),
        );
        const saved = await this.imageRepository.save(entities);
        return saved.map(
            (s) =>
                new TourImageDetailDTO({
                    id: s.id,
                    image_url: s.image_url,
                    sort_no: s.sort_no ?? undefined,
                    is_cover: !!s.is_cover,
                }),
        );
    }

    async removeImage(imageId: number): Promise<boolean> {
        const res = await this.imageRepository.delete({ id: imageId });
        return (res.affected ?? 0) > 0;
    }

    async addVariant(dto: TourVariantDTO): Promise<TourVariantSummaryDTO> {
        const variant = await this.variantRepository.save(
            this.variantRepository.create({
                name: dto.name,
                sort_no: dto.sort_no ?? 0,
                min_pax_per_booking: dto.min_pax_per_booking,
                capacity_per_slot: dto.capacity_per_slot ?? null,
                tax_included: !!dto.tax_included,
                cutoff_hours: dto.cutoff_hours,
                status: dto.status,
                tour: { id: dto.tour_id },
                currency: { id: dto.currency_id },
            }),
        );
        return new TourVariantSummaryDTO({
            id: variant.id,
            name: variant.name,
            status: variant.status as TourVariantStatus,
        });
    }

    async updateVariant(
        id: number,
        dto: Partial<TourVariantDTO>,
    ): Promise<TourVariantSummaryDTO | null> {
        const variant = await this.variantRepository.findOne({ where: { id } });
        if (!variant) return null;
        variant.name = dto.name ?? variant.name;
        variant.sort_no = dto.sort_no ?? variant.sort_no;
        variant.min_pax_per_booking =
            dto.min_pax_per_booking ?? variant.min_pax_per_booking;
        variant.capacity_per_slot =
            dto.capacity_per_slot ?? variant.capacity_per_slot;
        variant.tax_included = dto.tax_included ?? variant.tax_included;
        variant.cutoff_hours = dto.cutoff_hours ?? variant.cutoff_hours;
        variant.status = dto.status ?? variant.status;
        if (dto.tour_id) variant.tour = { id: dto.tour_id } as TourEntity;
        if (dto.currency_id)
            variant.currency = { id: dto.currency_id } as CurrencyEntity;
        await this.variantRepository.save(variant);
        return new TourVariantSummaryDTO({
            id,
            name: variant.name,
            status: variant.status as TourVariantStatus,
        });
    }

    async removeVariant(id: number): Promise<boolean> {
        const res = await this.variantRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async addSession(dto: TourSessionDTO): Promise<boolean> {
        const variant = await this.variantRepository.findOne({
            where: { id: dto.tour_variant_id },
        });
        if (!variant) return false;
        const entity = this.sessionRepository.create({
            tour_variant: variant,
            session_date: new Date(dto.session_date),
            start_time: dto.start_time
                ? new Date(`2025-01-01T${dto.start_time}Z`)
                : new Date('2025-01-01T00:00:00Z'),
            end_time: dto.end_time
                ? new Date(`2025-01-01T${dto.end_time}Z`)
                : null,
            capacity: dto.capacity ?? 0,
            status: dto.status,
        } as DeepPartial<TourSessionEntity>);
        await this.sessionRepository.save(entity);
        return true;
    }

    async updateSession(
        id: number,
        dto: Partial<TourSessionDTO>,
    ): Promise<boolean> {
        const session = await this.sessionRepository.findOne({ where: { id } });
        if (!session) return false;
        if (dto.tour_variant_id)
            session.tour_variant = {
                id: dto.tour_variant_id,
            } as TourVariantEntity;
        if (dto.session_date) session.session_date = new Date(dto.session_date);
        if (dto.start_time)
            session.start_time = new Date(`2025-01-01T${dto.start_time}Z`);
        if (dto.end_time)
            session.end_time = new Date(`2025-01-01T${dto.end_time}Z`);
        if (dto.capacity !== undefined) session.capacity = dto.capacity ?? null;
        if (dto.status) session.status = dto.status;
        await this.sessionRepository.save(session);
        return true;
    }

    async removeSession(id: number): Promise<boolean> {
        const res = await this.sessionRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async setPolicy(dto: TourPolicyDTO): Promise<boolean> {
        const variant = await this.variantRepository.findOne({
            where: { id: dto.tour_variant_id },
        });
        if (!variant) return false;
        const policy = await this.policyRepository.save(
            this.policyRepository.create({
                name: dto.name,
                tour_variant: variant,
            }),
        );
        if (dto.rules?.length) {
            const rules = dto.rules.map((r: TourPolicyRuleDTO) =>
                this.policyRuleRepository.create({
                    before_hours: r.before_hours,
                    fee_pct: r.fee_pct,
                    sort_no: r.sort_no,
                    tour_policy: policy,
                }),
            );
            await this.policyRuleRepository.save(rules);
        }
        return true;
    }

    async updatePolicy(
        policyId: number,
        dto: Partial<TourPolicyDTO>,
    ): Promise<boolean> {
        const policy = await this.policyRepository.findOne({
            where: { id: policyId },
            relations: ['tour_variant'],
        });
        if (!policy) return false;
        policy.name = dto.name ?? policy.name;
        if (dto.tour_variant_id)
            policy.tour_variant = {
                id: dto.tour_variant_id,
            } as TourVariantEntity;
        await this.policyRepository.save(policy);
        if (dto.rules) {
            const existing = await this.policyRuleRepository.find({
                where: { tour_policy: { id: policyId } },
            });
            if (existing.length)
                await this.policyRuleRepository.remove(existing);
            const rules = dto.rules.map((r: TourPolicyRuleDTO) =>
                this.policyRuleRepository.create({
                    before_hours: r.before_hours,
                    fee_pct: r.fee_pct,
                    sort_no: r.sort_no,
                    tour_policy: policy,
                }),
            );
            await this.policyRuleRepository.save(rules);
        }
        return true;
    }

    async removePolicy(id: number): Promise<boolean> {
        const res = await this.policyRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async addPriceRule(dto: TourPriceRuleDTO): Promise<boolean> {
        const variant = await this.variantRepository.findOne({
            where: { id: dto.tour_variant_id },
        });
        if (!variant) return false;
        const priceRule = await this.priceRuleRepository.save(
            this.priceRuleRepository.create({
                start_date: new Date(dto.start_date),
                end_date: new Date(dto.end_date),
                weekday_mask: dto.weekday_mask,
                price_type: dto.price_type,
                priority: dto.priority,
                tour_variant: variant,
            }),
        );
        if (dto.rule_prices?.length) {
            const paxTypes = await this.paxTypeRepository.find({
                where: { id: In(dto.rule_prices.map((rp) => rp.pax_type_id)) },
            });
            const paxMap = new Map<number, TourPaxTypeEntity>();
            paxTypes.forEach((p) => paxMap.set(p.id, p));
            const entities = dto.rule_prices.map(
                (rp: TourRulePaxTypePriceDTO) =>
                    this.rulePaxPriceRepository.create({
                        price: rp.price,
                        tour_price_rule: priceRule,
                        pax_type: paxMap.get(
                            rp.pax_type_id,
                        ) as TourPaxTypeEntity,
                    }),
            );
            await this.rulePaxPriceRepository.save(entities);
        }
        return true;
    }

    async updatePriceRule(
        id: number,
        dto: Partial<TourPriceRuleDTO>,
    ): Promise<boolean> {
        const rule = await this.priceRuleRepository.findOne({ where: { id } });
        if (!rule) return false;
        if (dto.tour_variant_id)
            rule.tour_variant = {
                id: dto.tour_variant_id,
            } as TourVariantEntity;
        if (dto.start_date) rule.start_date = new Date(dto.start_date);
        if (dto.end_date) rule.end_date = new Date(dto.end_date);
        if (dto.weekday_mask !== undefined)
            rule.weekday_mask = dto.weekday_mask;
        if (dto.price_type) rule.price_type = dto.price_type;
        if (dto.priority !== undefined) rule.priority = dto.priority;
        await this.priceRuleRepository.save(rule);
        if (dto.rule_prices) {
            const existing = await this.rulePaxPriceRepository.find({
                where: { tour_price_rule: { id } },
            });
            if (existing.length)
                await this.rulePaxPriceRepository.remove(existing);
            const paxTypes = await this.paxTypeRepository.find({
                where: { id: In(dto.rule_prices.map((rp) => rp.pax_type_id)) },
            });
            const paxMap = new Map<number, TourPaxTypeEntity>();
            paxTypes.forEach((p) => paxMap.set(p.id, p));
            const entities = dto.rule_prices.map(
                (rp: TourRulePaxTypePriceDTO) =>
                    this.rulePaxPriceRepository.create({
                        price: rp.price,
                        tour_price_rule: rule,
                        pax_type: paxMap.get(
                            rp.pax_type_id,
                        ) as TourPaxTypeEntity,
                    }),
            );
            await this.rulePaxPriceRepository.save(entities);
        }
        return true;
    }

    async removePriceRule(id: number): Promise<boolean> {
        const res = await this.priceRuleRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async setVariantPaxTypePrice(
        dto: TourVariantPaxTypePriceDTO,
    ): Promise<boolean> {
        const variant = await this.variantRepository.findOne({
            where: { id: dto.tour_variant_id },
        });
        const paxType = await this.paxTypeRepository.findOne({
            where: { id: dto.pax_type_id },
        });
        if (!variant || !paxType) return false;
        const existing = await this.variantPaxPriceRepository.findOne({
            where: {
                tour_variant: { id: variant.id },
                pax_type: { id: paxType.id },
            },
        });
        if (existing) {
            existing.price = dto.price;
            await this.variantPaxPriceRepository.save(existing);
            return true;
        }
        await this.variantPaxPriceRepository.save(
            this.variantPaxPriceRepository.create({
                price: dto.price,
                tour_variant: variant,
                pax_type: paxType,
            }),
        );
        return true;
    }
}

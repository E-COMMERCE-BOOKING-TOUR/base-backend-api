import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { TourEntity } from '../entity/tour.entity';
import { TourImageEntity } from '../entity/tourImage.entity';
import { TourVariantEntity } from '../entity/tourVariant.entity';
import { TourSessionEntity } from '../entity/tourSession.entity';
import { TourVariantPaxTypePriceEntity } from '../entity/tourVariantPaxTypePrice.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import { TourCategoryEntity } from '../entity/tourCategory.entity';
import { TourPolicyEntity } from '../entity/tourPolicy.entity';
import { TourPolicyRuleEntity } from '../entity/tourPolicyRule.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    TourDTO,
    TourVariantDTO,
    TourSessionDTO,
    AdminTourQueryDTO,
    PaginatedTourResponse,
    TourStatus,
    TourPolicyDTO,
} from '../dto/tour.dto';

interface VectorResponse {
    vector?: number[];
    insights?: unknown;
}

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
        @InjectRepository(TourVariantPaxTypePriceEntity)
        private readonly variantPaxPriceRepository: Repository<TourVariantPaxTypePriceEntity>,
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
        private readonly dataSource: DataSource,
        @Inject('RECOMMEND_SERVICE')
        private readonly recommendClient: ClientProxy,
    ) {}

    async getAllTours(
        query: AdminTourQueryDTO,
    ): Promise<PaginatedTourResponse> {
        const {
            keyword,
            status,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            sortOrder = 'DESC',
        } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.tourRepository
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.currency', 'currency')
            .leftJoinAndSelect('tour.supplier', 'supplier')
            .leftJoinAndSelect('tour.tour_categories', 'tour_categories')
            .leftJoinAndSelect('tour.images', 'images')
            .orderBy(`tour.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit);

        if (keyword) {
            queryBuilder.andWhere(
                '(tour.title LIKE :keyword OR tour.address LIKE :keyword)',
                { keyword: `%${keyword}%` },
            );
        }

        if (status) {
            queryBuilder.andWhere('tour.status = :status', { status });
        }

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getCountries(): Promise<CountryEntity[]> {
        return this.countryRepository.find({ order: { name: 'ASC' } });
    }

    async getDivisionsByCountry(countryId: number): Promise<DivisionEntity[]> {
        return this.divisionRepository.find({
            where: { country: { id: countryId } },
            order: { name_local: 'ASC' },
        });
    }

    async getCurrencies(): Promise<CurrencyEntity[]> {
        return this.currencyRepository.find({ order: { name: 'ASC' } });
    }

    async getPoliciesBySupplier(
        supplierId: number,
    ): Promise<TourPolicyEntity[]> {
        return this.dataSource.getRepository(TourPolicyEntity).find({
            where: { supplier: { id: supplierId } },
            relations: ['tour_policy_rules'],
            order: { name: 'ASC' },
        });
    }

    private slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    private generateRandomString(length: number): string {
        return Math.random()
            .toString(36)
            .substring(2, 2 + length);
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
                'variants.tour_policy',
                'variants.tour_policy.tour_policy_rules',
            ],
        });
        if (!tour) throw new NotFoundException(`Tour with ID ${id} not found`);
        return tour;
    }

    async getVisibilityReport(id: number) {
        const tour = await this.tourRepository.findOne({
            where: { id },
            relations: [
                'images',
                'variants',
                'variants.tour_sessions',
                'variants.tour_variant_pax_type_prices',
            ],
        });

        if (!tour) throw new NotFoundException(`Tour with ID ${id} not found`);

        const issues: string[] = [];
        const checks = {
            status: tour.status === TourStatus.active,
            is_visible: tour.is_visible,
            has_images: tour.images && tour.images.length > 0,
            has_variants: tour.variants && tour.variants.length > 0,
            has_active_variants: tour.variants?.some(
                (v) => v.status === 'active',
            ),
            has_pricing: tour.variants?.some((v) =>
                v.tour_variant_pax_type_prices?.some((p) => p.price > 0),
            ),
            has_upcoming_sessions: false,
        };

        if (tour.status !== TourStatus.active)
            issues.push('Tour status is not set to ACTIVE');
        if (!tour.is_visible) issues.push('Tour visibility is turned OFF');
        if (!checks.has_images) issues.push('No images uploaded for this tour');
        if (!checks.has_variants)
            issues.push('No variants defined for this tour');
        else if (!checks.has_active_variants)
            issues.push('No active variants found');

        if (checks.has_variants && !checks.has_pricing) {
            issues.push('No valid prices (>0) found in any variant');
        }

        // Check for upcoming open sessions
        const now = new Date();
        const dStr = now.toISOString().split('T')[0];

        checks.has_upcoming_sessions = tour.variants?.some((v) =>
            v.tour_sessions?.some(
                (s) => s.status === 'open' && s.session_date.toString() >= dStr,
            ),
        );

        if (!checks.has_upcoming_sessions) {
            issues.push('No upcoming open sessions found for this tour');
        }

        return {
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            isVisiblePublic:
                checks.status && checks.is_visible && issues.length === 0, // Simplified but accurate for the modal
            checks,
            issues,
        };
    }

    async createTour(dto: TourDTO): Promise<TourEntity> {
        const {
            tour_category_ids,
            images,
            variants,
            country_id,
            division_id,
            currency_id,
            supplier_id,
            ...rest
        } = dto;

        return await this.dataSource.transaction(async (manager) => {
            const categories = tour_category_ids?.length
                ? await manager.find(TourCategoryEntity, {
                      where: { id: In(tour_category_ids) },
                  })
                : [];

            const slug =
                dto.slug ||
                `${this.slugify(dto.title)}-${this.generateRandomString(4)}`;

            const tour = manager.create(TourEntity, {
                ...(rest as any),
                slug,
                country: { id: country_id },
                division: { id: division_id },
                currency: { id: currency_id },
                supplier: { id: supplier_id },
                tour_categories: categories,
            } as DeepPartial<TourEntity>);

            const savedTour = await manager.save(tour);

            if (images?.length) {
                const imageEntities = images.map((img) =>
                    manager.create(TourImageEntity, {
                        ...img,
                        tour: savedTour,
                    }),
                );
                await manager.save(imageEntities);
            }

            if (variants?.length) {
                for (const vDto of variants) {
                    const {
                        sessions: vSessions,
                        prices: vPrices,
                        currency_id: vCurrencyId,
                        ...vRest
                    } = vDto;
                    const variant = manager.create(TourVariantEntity, {
                        ...(vRest as any),
                        tour: savedTour,
                        currency: { id: vCurrencyId || currency_id },
                        tour_policy: { id: vDto.tour_policy_id },
                    });

                    const savedVariant = await manager.save(variant);

                    if (vPrices?.length) {
                        const priceEntities = vPrices.map((p) => {
                            const { pax_type_id, ...pRest } = p;
                            return manager.create(
                                TourVariantPaxTypePriceEntity,
                                {
                                    ...(pRest as any),
                                    tour_variant: savedVariant,
                                    pax_type: { id: pax_type_id },
                                } as DeepPartial<TourVariantPaxTypePriceEntity>,
                            );
                        });
                        await manager.save(priceEntities);
                    }

                    if (vSessions?.length) {
                        const sessionEntities = vSessions.map((s) => {
                            const { ...sRest } = s;
                            return manager.create(TourSessionEntity, {
                                ...(sRest as any),
                                tour_variant: savedVariant,
                                session_date: new Date(s.session_date),
                                start_time: s.start_time
                                    ? new Date(`1970-01-01 ${s.start_time}`)
                                    : undefined,
                                end_time: s.end_time
                                    ? new Date(`1970-01-01 ${s.end_time}`)
                                    : undefined,
                            } as DeepPartial<TourSessionEntity>);
                        });
                        await manager.save(sessionEntities);
                    }
                }
            }

            const reloadedTour = await manager.findOne(TourEntity, {
                where: { id: savedTour.id },
                relations: [
                    'variants',
                    'images',
                    'tour_categories',
                    'variants.tour_sessions',
                    'variants.tour_variant_pax_type_prices',
                ],
            });

            if (!reloadedTour)
                throw new Error('Failed to create and reload tour');

            // Trigger vector generation in background
            this.triggerTourVectorGeneration(reloadedTour.id).catch((err) =>
                console.error(
                    `Auto vector generation failed for tour ${reloadedTour.id}:`,
                    err,
                ),
            );

            return reloadedTour;
        });
    }

    async updateTour(id: number, dto: Partial<TourDTO>): Promise<TourEntity> {
        return await this.dataSource.transaction(async (manager) => {
            const tour = await manager.findOne(TourEntity, {
                where: { id },
                relations: [
                    'variants',
                    'images',
                    'tour_categories',
                    'currency',
                    'variants.tour_sessions',
                    'variants.tour_variant_pax_type_prices',
                    'variants.tour_policy',
                ],
            });

            if (!tour)
                throw new NotFoundException(`Tour with ID ${id} not found`);

            const { tour_category_ids, images, variants, ...rest } = dto;

            // 1. Update basic fields
            Object.assign(tour, rest);
            if (dto.country_id)
                tour.country = { id: dto.country_id } as CountryEntity;
            if (dto.division_id)
                tour.division = { id: dto.division_id } as DivisionEntity;
            if (dto.currency_id)
                tour.currency = { id: dto.currency_id } as CurrencyEntity;
            if (dto.supplier_id)
                tour.supplier = { id: dto.supplier_id } as SupplierEntity;

            if (tour_category_ids) {
                tour.tour_categories = await manager.find(TourCategoryEntity, {
                    where: { id: In(tour_category_ids) },
                });
            }

            const savedTour = await manager.save(tour);

            // 2. Handle Images (Simple sync)
            if (images) {
                await manager.delete(TourImageEntity, {
                    tour: { id: savedTour.id },
                });
                const imageEntities = images.map((img) =>
                    manager.create(TourImageEntity, {
                        ...img,
                        tour: savedTour,
                    }),
                );
                await manager.save(imageEntities);
            }

            // 3. Handle Variants
            if (variants) {
                const existingVariants = tour.variants || [];
                const incomingVariantIds = variants
                    .map((v) => v.id)
                    .filter(Boolean);

                // Delete variants not in incoming DTO
                const variantsToDelete = existingVariants.filter(
                    (v) => !incomingVariantIds.includes(v.id),
                );
                if (variantsToDelete.length > 0) {
                    for (const v of variantsToDelete) {
                        // Delete related prices and sessions first
                        await manager.delete(TourVariantPaxTypePriceEntity, {
                            tour_variant: { id: v.id },
                        });
                        await manager.delete(TourSessionEntity, {
                            tour_variant: { id: v.id },
                        });
                    }
                    await manager.remove(variantsToDelete);
                }

                for (const vDto of variants) {
                    const vDtoAny = vDto as TourVariantDTO & {
                        tour_sessions?: any[];
                    };
                    const {
                        id: vId,
                        sessions: vSessions,
                        prices: vPrices,
                        currency_id: vCurrencyId,
                        ...vRest
                    } = vDtoAny;
                    const vTourSessions = vDtoAny.tour_sessions;
                    const activeSessions = (vSessions ||
                        vTourSessions) as TourSessionDTO[];

                    let variant: TourVariantEntity;
                    if (vId) {
                        const found = existingVariants.find(
                            (v) => v.id === vId,
                        );
                        if (!found)
                            throw new NotFoundException(
                                `Variant with ID ${vId} not found`,
                            );
                        variant = found;
                        Object.assign(variant, vRest);
                        variant.currency = {
                            id: vCurrencyId || tour.currency.id,
                        } as CurrencyEntity;
                        variant.tour_policy = {
                            id: vDtoAny.tour_policy_id,
                        } as TourPolicyEntity;
                    } else {
                        variant = manager.create(TourVariantEntity, {
                            ...vRest,
                            tour: savedTour,
                            currency: { id: vCurrencyId || tour.currency.id },
                            tour_policy: vDtoAny.tour_policy_id
                                ? { id: vDtoAny.tour_policy_id }
                                : undefined,
                        } as any);
                    }

                    const savedVariant = await manager.save(variant);

                    // Sync Prices
                    if (vPrices) {
                        await manager.delete(TourVariantPaxTypePriceEntity, {
                            tour_variant: { id: savedVariant.id },
                        });
                        const priceEntities = vPrices.map((p) => {
                            const { pax_type_id, ...pRest } = p;
                            return manager.create(
                                TourVariantPaxTypePriceEntity,
                                {
                                    ...pRest,
                                    tour_variant: savedVariant,
                                    pax_type: { id: pax_type_id },
                                },
                            );
                        });
                        await manager.save(priceEntities);
                    }

                    if (activeSessions) {
                        const existingSessions = variant.tour_sessions || [];

                        const getSessionKey = (
                            date: string | number | Date,
                            time: unknown,
                        ) => {
                            const dStr = new Date(date)
                                .toISOString()
                                .split('T')[0];
                            const t = time;
                            const tStr =
                                t instanceof Date
                                    ? t.toLocaleTimeString('en-GB', {
                                          hour12: false,
                                      })
                                    : typeof t === 'string'
                                      ? t
                                      : '00:00:00';
                            // Normalize to HH:mm:ss if it's HH:mm
                            const normalizedTime =
                                tStr.length === 5 ? `${tStr}:00` : tStr;
                            return `${dStr}|${normalizedTime}`;
                        };

                        const incomingKeys = activeSessions.map((s) =>
                            getSessionKey(s.session_date, s.start_time),
                        );

                        // Delete sessions not in incoming DTO (match by Date AND Time)
                        const sessionsToDelete = existingSessions.filter(
                            (s) =>
                                !incomingKeys.includes(
                                    getSessionKey(s.session_date, s.start_time),
                                ),
                        );

                        if (sessionsToDelete.length > 0) {
                            await manager.delete(TourSessionEntity, {
                                id: In(sessionsToDelete.map((s) => s.id)),
                            });
                        }

                        for (const sDto of activeSessions) {
                            const targetKey = getSessionKey(
                                sDto.session_date,
                                sDto.start_time,
                            );
                            let session = existingSessions.find(
                                (s) =>
                                    getSessionKey(
                                        s.session_date,
                                        s.start_time,
                                    ) === targetKey,
                            );

                            if (session) {
                                // Update existing session
                                session.capacity =
                                    sDto.capacity || session.capacity;
                                session.status = sDto.status || session.status;
                                if (sDto.start_time)
                                    session.start_time = new Date(
                                        `1970-01-01 ${sDto.start_time}`,
                                    );
                                if (sDto.end_time)
                                    session.end_time = new Date(
                                        `1970-01-01 ${sDto.end_time}`,
                                    );
                                // We don't change capacity_available here as it depends on bookings
                            } else {
                                // Create new session
                                session = manager.create(TourSessionEntity, {
                                    tour_variant: savedVariant,
                                    session_date: new Date(sDto.session_date),
                                    status: sDto.status || 'open',
                                    capacity: sDto.capacity,
                                    capacity_available: sDto.capacity,
                                    start_time: sDto.start_time,
                                    end_time: sDto.end_time,
                                });
                            }
                            await manager.save(session);
                        }
                    }
                }
            }

            // Trigger vector generation in background
            this.triggerTourVectorGeneration(id).catch((err) =>
                console.error(`Auto vector update failed for tour ${id}:`, err),
            );

            return this.getTourById(id);
        });
    }

    async updateStatus(id: number, status: string): Promise<TourEntity> {
        const tour = await this.tourRepository.findOne({ where: { id } });
        if (!tour) throw new NotFoundException(`Tour with ID ${id} not found`);
        tour.status = status as TourStatus;
        return this.tourRepository.save(tour);
    }

    async removeTour(id: number): Promise<void> {
        await this.tourRepository.softDelete(id);
    }

    // --- Variant Management ---

    async updateVariant(
        id: number,
        dto: Partial<TourVariantDTO>,
    ): Promise<TourVariantEntity> {
        const variant = await this.variantRepository.findOne({ where: { id } });
        if (!variant) throw new NotFoundException(`Variant ${id} not found`);
        Object.assign(variant, dto);
        if (dto.currency_id)
            variant.currency = { id: dto.currency_id } as CurrencyEntity;
        return this.variantRepository.save(variant);
    }

    async triggerTourVectorGeneration(tourId: number) {
        const tour = await this.tourRepository.findOne({
            where: { id: tourId },
            relations: ['images'],
        });
        if (!tour) return;

        try {
            const response: VectorResponse = await firstValueFrom(
                this.recommendClient.send(
                    { cmd: 'generate_tour_vector' },
                    {
                        title: tour.title,
                        description: tour.description,
                        summary: tour.summary,
                        address: tour.address,
                        imageUrls: tour.images.map((img) => img.image_url),
                        numeric: {
                            price: tour.cached_min_price || 0,
                            duration_days: tour.duration_days || 0,
                        },
                    },
                ),
            );

            if (response && response.vector) {
                tour.vector = response.vector;
                tour.insight_data = response.insights
                    ? JSON.stringify(response.insights)
                    : `Generated insight.`;
                await this.tourRepository.save(tour);
            }
        } catch (error) {
            console.error(
                `Error in triggerTourVectorGeneration for tour ${tourId}:`,
                error,
            );
        }
    }

    async generateVectorsForAllTours() {
        const tours = await this.tourRepository.find({
            relations: ['images', 'tour_categories'],
        });

        const results: any[] = [];
        for (const tour of tours) {
            try {
                await this.triggerTourVectorGeneration(tour.id);
                results.push({ id: tour.id, status: 'success' });
            } catch (error) {
                results.push({
                    id: tour.id,
                    status: 'error',
                    message: (error as Error).message,
                });
            }
        }

        return {
            total: tours.length,
            processed: results.length,
            details: results,
        };
    }
    async removeVariant(id: number): Promise<void> {
        await this.variantRepository.delete(id);
    }

    // --- Session Management ---

    async removeSession(id: number): Promise<void> {
        await this.sessionRepository.delete(id);
    }

    // --- Policy Management ---

    async createPolicy(dto: TourPolicyDTO): Promise<TourPolicyEntity> {
        return await this.dataSource.transaction(async (manager) => {
            const policy = manager.create(TourPolicyEntity, {
                name: dto.name,
                supplier: { id: dto.supplier_id },
            });
            const savedPolicy = await manager.save(policy);

            if (dto.rules?.length) {
                const rules = dto.rules.map((r) =>
                    manager.create(TourPolicyRuleEntity, {
                        ...r,
                        tour_policy: savedPolicy,
                    }),
                );
                await manager.save(rules);
            }

            const result = await manager.findOne(TourPolicyEntity, {
                where: { id: savedPolicy.id },
                relations: ['tour_policy_rules'],
            });

            if (!result) throw new Error('Failed to create policy');
            return result;
        });
    }

    async updatePolicy(
        id: number,
        dto: Partial<TourPolicyDTO>,
    ): Promise<TourPolicyEntity> {
        return await this.dataSource.transaction(async (manager) => {
            const policy = await manager.findOne(TourPolicyEntity, {
                where: { id },
                relations: ['tour_policy_rules'],
            });
            if (!policy) throw new NotFoundException(`Policy ${id} not found`);

            if (dto.name) policy.name = dto.name;
            await manager.save(policy);

            if (dto.rules) {
                // For simplicity, replace rules
                await manager.delete(TourPolicyRuleEntity, {
                    tour_policy: { id },
                });
                const rules = dto.rules.map((r) =>
                    manager.create(TourPolicyRuleEntity, {
                        ...r,
                        tour_policy: policy,
                    }),
                );
                await manager.save(rules);
            }

            const result = await manager.findOne(TourPolicyEntity, {
                where: { id: policy.id },
                relations: ['tour_policy_rules'],
            });

            if (!result) throw new Error('Failed to update policy');
            return result;
        });
    }

    async removePolicy(id: number): Promise<void> {
        await this.dataSource.getRepository(TourPolicyEntity).delete(id);
    }
}

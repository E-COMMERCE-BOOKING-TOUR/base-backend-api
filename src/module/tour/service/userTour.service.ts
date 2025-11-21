import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from '../entity/tour.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
    UserTourPopularDTO,
    UserTourDetailDTO,
    TourActivityDTO,
    TourDetailsInfoDTO,
    TourTestimonialDTO,
    UserTourReviewDTO,
    UserTourReviewCategoryDTO,
    UserTourRelatedDTO,
    UserTourSearchQueryDTO,
    TourPaxTypePriceDto,
    UserTourVariantDTO,
    UserTourVariantPaxPriceDTO,
} from '../dto/tour.dto';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { TourVariantEntity } from '../entity/tourVariant.entity';
import { TourPaxTypeEntity } from '../entity/tourPaxType.entity';
import { TourVariantPaxTypePriceEntity } from '../entity/tourVariantPaxTypePrice.entity';
import { TourPriceRuleEntity } from '../entity/tourPriceRule.entity';
import { TourRulePaxTypePriceEntity } from '../entity/tourRulePaxTypePrice.entity';

@Injectable()
export class UserTourService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(ReviewEntity)
        private readonly reviewRepository: Repository<ReviewEntity>,
    ) { }

    private createBaseTourQuery(): SelectQueryBuilder<TourEntity> {
        return this.tourRepository
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.images', 'images')
            .leftJoinAndSelect('tour.variants', 'variants')
            .leftJoinAndSelect(
                'variants.tour_variant_pax_type_prices',
                'prices',
            )
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect(
                'tour.reviews',
                'reviews',
                'reviews.status = :reviewStatus',
                { reviewStatus: 'approved' },
            )
            .leftJoinAndSelect('tour.tour_categories', 'categories')
            .where('tour.status = :tourStatus', { tourStatus: 'active' })
            .andWhere('tour.is_visible = :isVisible', { isVisible: true });
    }

    private mapToPopularDTO(tour: TourEntity): UserTourPopularDTO {
        const coverImage =
            tour.images?.find((img) => img.is_cover) || tour.images?.[0];
        const imageUrl: string =
            coverImage?.image_url || '/assets/images/travel.jpg';

        const reviewsCount: number = tour.reviews?.length || 0;
        const avgRating: number = tour.score_rating || 0;

        let ratingText: string = 'Good';
        if (avgRating >= 9) ratingText = 'Excellent';
        else if (avgRating >= 8) ratingText = 'Very good';
        else if (avgRating >= 7) ratingText = 'Good';
        else if (avgRating >= 6) ratingText = 'Okay';

        const location: string =
            tour.division && tour.country
                ? `${tour.division.name}, ${tour.country.name}`
                : tour.address;

        const minPax: number = tour.min_pax || 1;
        const maxPax: number = tour.max_pax || minPax + 2;
        const capacity: string = `${minPax}-${maxPax} people`;

        let currentPrice: number = 0;
        let originalPrice: number | undefined;

        if (tour.variants && tour.variants.length > 0) {
            const activeVariant = tour.variants.find(
                (v) => v.status === 'active',
            );
            if (
                activeVariant &&
                activeVariant.tour_variant_pax_type_prices?.length > 0
            ) {
                const prices: number[] =
                    activeVariant.tour_variant_pax_type_prices
                        .map((p) => p.price)
                        .filter((p) => p > 0);

                if (prices.length > 0) {
                    currentPrice = Math.min(...prices);
                    originalPrice = Math.round(currentPrice * 1.3);
                }
            }
        }

        const tags: string[] =
            tour.tour_categories?.map((cat) => cat.name) || [];

        return new UserTourPopularDTO({
            id: tour.id,
            title: tour.title,
            location,
            image: imageUrl,
            rating: avgRating,
            reviews: reviewsCount,
            ratingText,
            capacity,
            originalPrice,
            currentPrice,
            tags,
            slug: tour.slug,
        });
    }

    async getPopularTours(limit: number = 8): Promise<UserTourPopularDTO[]> {
        const tours = await this.createBaseTourQuery()
            .orderBy('tour.score_rating', 'DESC')
            .addOrderBy('tour.created_at', 'DESC')
            .take(limit)
            .getMany();

        return tours.map((tour) => this.mapToPopularDTO(tour));
    }

    async searchTours(query: UserTourSearchQueryDTO) {
        const qb = this.createBaseTourQuery();

        if (query.keyword) {
            const normalizedKeyword = query.keyword.toLowerCase();
            qb.andWhere(
                new Brackets((subQb) => {
                    const keywordParam = `%${normalizedKeyword}%`;
                    subQb
                        .where('LOWER(tour.title) LIKE :keyword', {
                            keyword: keywordParam,
                        })
                        .orWhere('LOWER(tour.summary) LIKE :keyword', {
                            keyword: keywordParam,
                        })
                        .orWhere('LOWER(tour.address) LIKE :keyword', {
                            keyword: keywordParam,
                        })
                        .orWhere('LOWER(division.name) LIKE :keyword', {
                            keyword: keywordParam,
                        })
                        .orWhere('LOWER(country.name) LIKE :keyword', {
                            keyword: keywordParam,
                        });
                }),
            );
        }

        if (query.destinations?.length) {
            qb.andWhere(
                new Brackets((destinationQb) => {
                    query.destinations?.forEach((destination, index) => {
                        const destinationParam = `destination_${index}`;
                        const countryParam = `country_${index}`;
                        const combinedParam = `combined_${index}`;
                        const value = `%${destination.toLowerCase()}%`;

                        destinationQb.orWhere(
                            `LOWER(division.name) LIKE :${destinationParam}`,
                            {
                                [destinationParam]: value,
                            },
                        );
                        destinationQb.orWhere(
                            `LOWER(country.name) LIKE :${countryParam}`,
                            {
                                [countryParam]: value,
                            },
                        );
                        destinationQb.orWhere(
                            `LOWER(CONCAT(COALESCE(division.name, ''), ', ', COALESCE(country.name, ''))) LIKE :${combinedParam}`,
                            { [combinedParam]: value },
                        );
                    });
                }),
            );
        }

        if (query.tags?.length) {
            qb.andWhere('categories.name IN (:...tags)', { tags: query.tags });
        }

        if (typeof query.minRating === 'number') {
            qb.andWhere('tour.score_rating >= :minRating', {
                minRating: query.minRating,
            });
        }

        const priceFilterSubQuery = (
            operator: '>=' | '<=',
            paramName: string,
        ) => `
            EXISTS (
                SELECT 1
                FROM tour_variants tv
                INNER JOIN tour_variant_pax_type_prices tvp ON tvp.tour_variant_id = tv.id
                WHERE tv.tour_id = tour.id
                  AND tv.status = 'active'
                  AND tvp.price ${operator} :${paramName}
            )
        `;

        if (typeof query.minPrice === 'number') {
            qb.andWhere(priceFilterSubQuery('>=', 'minPrice'), {
                minPrice: query.minPrice,
            });
        }

        if (typeof query.maxPrice === 'number') {
            qb.andWhere(priceFilterSubQuery('<=', 'maxPrice'), {
                maxPrice: query.maxPrice,
            });
        }

        const priceOrderSubQuery = `
            (SELECT MIN(tvp.price)
             FROM tour_variants tv
             INNER JOIN tour_variant_pax_type_prices tvp ON tvp.tour_variant_id = tv.id
             WHERE tv.tour_id = tour.id
               AND tv.status = 'active')
        `;

        switch (query.sort) {
            case 'price_asc':
                qb.addSelect(priceOrderSubQuery, 'min_price_value')
                    .orderBy(
                        'CASE WHEN min_price_value IS NULL THEN 1 ELSE 0 END',
                        'ASC',
                    )
                    .addOrderBy('min_price_value', 'ASC');
                break;
            case 'price_desc':
                qb.addSelect(priceOrderSubQuery, 'min_price_value')
                    .orderBy(
                        'CASE WHEN min_price_value IS NULL THEN 1 ELSE 0 END',
                        'ASC',
                    )
                    .addOrderBy('min_price_value', 'DESC');
                break;
            case 'rating_desc':
                qb.orderBy('tour.score_rating', 'DESC').addOrderBy(
                    'tour.created_at',
                    'DESC',
                );
                break;
            case 'newest':
                qb.orderBy('tour.created_at', 'DESC');
                break;
            default:
                qb.orderBy('tour.score_rating', 'DESC').addOrderBy(
                    'tour.created_at',
                    'DESC',
                );
        }

        const offset = query.offset || 0;
        const limit = query.limit || 12;

        qb.skip(offset).take(limit);

        const [tours, total] = await qb.getManyAndCount();

        return {
            data: tours.map((tour) => this.mapToPopularDTO(tour)),
            total,
            limit,
            offset,
        };
    }

    async getTourDetailBySlug(slug: string): Promise<UserTourDetailDTO> {
        const tour = await this.tourRepository
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.images', 'images')
            .leftJoinAndSelect('tour.variants', 'variants')
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect(
                'tour.reviews',
                'reviews',
                'reviews.status = :status',
                { status: 'approved' },
            )
            .leftJoinAndSelect('reviews.user', 'user')
            .leftJoinAndSelect('user.country', 'userCountry')
            .leftJoinAndSelect(
                'variants.tour_variant_pax_type_prices',
                'prices',
            )
            .leftJoinAndSelect('prices.pax_type', 'paxType')
            .leftJoinAndSelect('tour.tour_categories', 'categories')
            .where('tour.slug = :slug', { slug })
            .andWhere('tour.status = :status', { status: 'active' })
            .andWhere('tour.is_visible = :isVisible', { isVisible: true })
            .getOne();

        if (!tour) {
            throw new NotFoundException(`Tour with slug "${slug}" not found`);
        }

        const location: string =
            tour.division && tour.country
                ? `${tour.address}, ${tour.division.name}, ${tour.country.name}`
                : tour.address;

        const images: string[] =
            tour.images
                ?.sort((a, b) => {
                    if (a.is_cover) return -1;
                    if (b.is_cover) return 1;
                    return (a.sort_no || 0) - (b.sort_no || 0);
                })
                .map((img) => img.image_url) || [];

        const reviewsCount: number = tour.reviews?.length || 0;
        const avgRating: number = tour.score_rating || 0;

        let scoreLabel: string = 'New';
        if (avgRating >= 9) scoreLabel = 'Excellent';
        else if (avgRating >= 8.5) scoreLabel = 'Fabulous';
        else if (avgRating >= 8) scoreLabel = 'Very good';
        else if (avgRating >= 7) scoreLabel = 'Good';
        else if (avgRating >= 6) scoreLabel = 'Okay';
        else if (avgRating > 0) scoreLabel = 'Fair';

        const staffScore: number =
            avgRating > 0 ? Math.min(10, avgRating + 0.4) : 8.0;

        let currentPrice: number = 0;
        let originalPrice: number | undefined;

        if (tour.variants && tour.variants.length > 0) {
            const activeVariant = tour.variants.find(
                (v) => v.status === 'active',
            );
            if (
                activeVariant &&
                activeVariant.tour_variant_pax_type_prices?.length > 0
            ) {
                const prices: number[] =
                    activeVariant.tour_variant_pax_type_prices
                        .map((p) => p.price)
                        .filter((p) => p > 0);

                if (prices.length > 0) {
                    currentPrice = Math.min(...prices);
                    originalPrice = Math.round(currentPrice * 1.5);
                }
            }
        }

        const tags: string[] =
            tour.tour_categories?.map((cat) => cat.name) || [];

        let durationStr = '';
        if (tour.duration_days && tour.duration_days > 0) {
            durationStr = `${tour.duration_days} ${tour.duration_days > 1 ? 'days' : 'day'}`;
            if (tour.duration_hours && tour.duration_hours > 0) {
                durationStr += ` ${tour.duration_hours} hours`;
            }
        } else if (tour.duration_hours && tour.duration_hours > 0) {
            durationStr = `${tour.duration_hours} ${tour.duration_hours > 1 ? 'hours' : 'hour'}`;
        } else {
            durationStr = 'Flexible';
        }

        const minPax: number = tour.min_pax || 1;
        const maxPax: number = tour.max_pax || minPax + 2;
        const capacity: string = `${maxPax} People`;

        const included: string[] = [];
        const notIncluded: string[] = [];

        let testimonial: TourTestimonialDTO | undefined;
        if (tour.reviews && tour.reviews.length > 0) {
            const latestReview = tour.reviews[0];
            const userName =
                latestReview.user?.full_name ||
                latestReview.user?.username ||
                'Customer';
            const userCountry = latestReview.user?.country?.name || 'Vietnam';

            testimonial = new TourTestimonialDTO({
                name: userName,
                country: userCountry,
                text:
                    latestReview.content.length > 150
                        ? latestReview.content.substring(0, 150) + '...'
                        : latestReview.content,
            });
        }

        const details = new TourDetailsInfoDTO({
            language: ['English', 'Vietnamese'],
            duration: durationStr,
            capacity: capacity,
        });

        const activity: TourActivityDTO | undefined = tour.summary
            ? new TourActivityDTO({
                title: 'What You Will Do',
                items: [tour.summary],
            })
            : undefined;

        return new UserTourDetailDTO({
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            location,
            price: currentPrice,
            oldPrice: originalPrice,
            rating: avgRating > 0 ? Math.round(avgRating) : 0,
            reviewCount: reviewsCount,
            score: avgRating,
            scoreLabel,
            staffScore: parseFloat(staffScore.toFixed(1)),
            images: images.length > 0 ? images : ['/assets/images/travel.jpg'],
            testimonial,
            mapUrl: tour.map_url || '',
            mapPreview:
                images.length > 0 ? images[0] : '/assets/images/travel.jpg',
            description: tour.description || '',
            summary: tour.summary || '',
            activity,
            included,
            notIncluded,
            details,
            meetingPoint: '',
            tags,
            variants:
                tour.variants?.map(
                    (v) =>
                        new UserTourVariantDTO({
                            id: v.id,
                            name: v.name,
                            status: v.status,
                            prices:
                                v.tour_variant_pax_type_prices?.map(
                                    (p) =>
                                        new UserTourVariantPaxPriceDTO({
                                            id: p.id,
                                            pax_type_id: p.pax_type?.id,
                                            price: p.price,
                                            pax_type_name: p.pax_type?.name,
                                        }),
                                ) || [],
                        }),
                ) || [],
        });
    }

    async getTourReviews(slug: string): Promise<UserTourReviewDTO[]> {
        const tour = await this.tourRepository.findOne({
            where: { slug, status: 'active', is_visible: true },
        });

        if (!tour) {
            throw new NotFoundException(`Tour with slug "${slug}" not found`);
        }

        const reviews = await this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .where('review.tour_id = :tourId', { tourId: tour.id })
            .andWhere('review.status = :status', { status: 'approved' })
            .orderBy('review.created_at', 'DESC')
            .getMany();

        return reviews.map((review): UserTourReviewDTO => {
            const date = new Date(review.created_at);
            const dateStr = date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            return new UserTourReviewDTO({
                id: review.id.toString(),
                userName:
                    review.user?.full_name ||
                    review.user?.username ||
                    'Anonymous',
                userAvatar: `https://i.pravatar.cc/150?img=${review.id}`,
                rating: review.rating,
                date: dateStr,
                title: review.title,
                content: review.content,
                verified: true,
            });
        });
    }

    async getTourReviewCategories(
        slug: string,
    ): Promise<UserTourReviewCategoryDTO[]> {
        const tour = await this.tourRepository.findOne({
            where: { slug, status: 'active', is_visible: true },
            relations: ['reviews'],
        });

        if (!tour) {
            throw new NotFoundException(`Tour with slug "${slug}" not found`);
        }

        const approvedReviews =
            tour.reviews?.filter((r) => r.status === 'approved') || [];

        if (approvedReviews.length === 0) {
            return [];
        }

        const avgRating = tour.score_rating || 0;

        return [
            new UserTourReviewCategoryDTO({
                label: 'Guide',
                score: parseFloat((avgRating + 0.1).toFixed(1)),
            }),
            new UserTourReviewCategoryDTO({
                label: 'Transportation',
                score: parseFloat((avgRating - 0.5).toFixed(1)),
            }),
            new UserTourReviewCategoryDTO({
                label: 'Value for money',
                score: parseFloat(avgRating.toFixed(1)),
            }),
            new UserTourReviewCategoryDTO({
                label: 'Safety',
                score: parseFloat((avgRating - 0.2).toFixed(1)),
            }),
        ];
    }

    async getRelatedTours(
        slug: string,
        limit: number = 8,
    ): Promise<UserTourRelatedDTO[]> {
        const currentTour = await this.tourRepository.findOne({
            where: { slug },
            relations: ['tour_categories'],
        });

        if (!currentTour) {
            throw new NotFoundException(`Tour with slug "${slug}" not found`);
        }

        const categoryIds =
            currentTour.tour_categories?.map((cat) => cat.id) || [];

        let query = this.tourRepository
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.images', 'images')
            .leftJoinAndSelect('tour.variants', 'variants')
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect(
                'tour.reviews',
                'reviews',
                'reviews.status = :status',
                { status: 'approved' },
            )
            .leftJoinAndSelect(
                'variants.tour_variant_pax_type_prices',
                'prices',
            )
            .leftJoinAndSelect('tour.tour_categories', 'categories')
            .where('tour.status = :status', { status: 'active' })
            .andWhere('tour.is_visible = :isVisible', { isVisible: true })
            .andWhere('tour.id != :currentTourId', {
                currentTourId: currentTour.id,
            });

        if (categoryIds.length > 0) {
            query = query.andWhere('categories.id IN (:...categoryIds)', {
                categoryIds,
            });
        }

        const tours = await query
            .orderBy('tour.score_rating', 'DESC')
            .addOrderBy('tour.created_at', 'DESC')
            .take(limit)
            .getMany();

        return tours.map((tour): UserTourRelatedDTO => {
            const coverImage =
                tour.images?.find((img) => img.is_cover) || tour.images?.[0];
            const imageUrl: string =
                coverImage?.image_url || '/assets/images/travel.jpg';

            const reviewsCount: number = tour.reviews?.length || 0;
            const avgRating: number = tour.score_rating || 0;

            let ratingText: string = 'Good';
            if (avgRating >= 9) ratingText = 'Excellent';
            else if (avgRating >= 8) ratingText = 'Very good';
            else if (avgRating >= 7) ratingText = 'Good';
            else if (avgRating >= 6) ratingText = 'Okay';

            const location: string =
                tour.division && tour.country
                    ? `${tour.division.name}, ${tour.country.name}`
                    : tour.address;

            const minPax: number = tour.min_pax || 1;
            const maxPax: number = tour.max_pax || minPax + 2;
            const capacity: string = `${minPax}-${maxPax} people`;

            let currentPrice: number = 0;
            let originalPrice: number = 0;

            if (tour.variants && tour.variants.length > 0) {
                const activeVariant = tour.variants.find(
                    (v) => v.status === 'active',
                );
                if (
                    activeVariant &&
                    activeVariant.tour_variant_pax_type_prices?.length > 0
                ) {
                    const prices: number[] =
                        activeVariant.tour_variant_pax_type_prices
                            .map((p) => p.price)
                            .filter((p) => p > 0);

                    if (prices.length > 0) {
                        currentPrice = Math.min(...prices);
                        originalPrice = Math.round(currentPrice * 1.3);
                    }
                }
            }

            const tags: string[] =
                tour.tour_categories?.map((cat) => cat.name) || [];

            return new UserTourRelatedDTO({
                id: tour.id.toString(),
                image: imageUrl,
                title: tour.title,
                location,
                rating: avgRating,
                reviews: reviewsCount,
                ratingText,
                capacity,
                originalPrice,
                currentPrice,
                tags,
                slug: tour.slug,
            });
        });
    }

    async getPricesBySlug(
        slug: string,
    ): Promise<TourPaxTypePriceDto[]> {
        const tour = await this.tourRepository.findOne({
            where: {
                slug,
                status: 'active',
                is_visible: true,
            },
            relations: [
                'variants',
                'variants.tour_variant_pax_type_prices',
                'variants.tour_variant_pax_type_prices.pax_type',
                'variants.tour_price_rules',
                'variants.tour_price_rules.tour_rule_pax_type_prices',
                'variants.tour_price_rules.tour_rule_pax_type_prices.pax_type',
            ],
        });

        if (!tour) {
            throw new NotFoundException(
                `Tour with slug "${slug}" not found or inactive`,
            );
        }

        return this.computeTourPricing(tour);
    }

    computeTourPricing(tour: TourEntity): TourPaxTypePriceDto[] {
        const activeVariants: TourVariantEntity[] =
            tour.variants?.filter((v) => v.status === 'active') ?? [];

        if (activeVariants.length === 0) {
            return [];
        }

        const basePriceMap = new Map<
            number,
            { price: number; paxType: TourPaxTypeEntity }
        >();

        for (const variant of activeVariants) {
            const prices: TourVariantPaxTypePriceEntity[] =
                variant.tour_variant_pax_type_prices ?? [];

            for (const p of prices) {
                if (!p.price || p.price <= 0) continue;
                const paxType = p.pax_type;
                if (!paxType) continue;

                const paxTypeId = paxType.id;
                const current = basePriceMap.get(paxTypeId);

                if (!current || p.price < current.price) {
                    basePriceMap.set(paxTypeId, { price: p.price, paxType });
                }
            }
        }

        const ruleMap = new Map<
            number,
            {
                effectivePrice: number;
                rule: TourPriceRuleEntity;
                rulePrice: TourRulePaxTypePriceEntity;
            }
        >();

        for (const variant of activeVariants) {
            const rules: TourPriceRuleEntity[] = variant.tour_price_rules ?? [];

            for (const rule of rules) {
                const rulePaxPrices: TourRulePaxTypePriceEntity[] =
                    rule.tour_rule_pax_type_prices ?? [];

                for (const rp of rulePaxPrices) {
                    const paxType = rp.pax_type;
                    if (!paxType) continue;

                    const paxTypeId = paxType.id;
                    const baseForPax =
                        basePriceMap.get(paxTypeId)?.price ?? null;

                    let effectivePrice: number | null = null;

                    if (rule.price_type === 'absolute') {
                        effectivePrice = rp.price;
                    } else if (rule.price_type === 'delta') {
                        if (baseForPax != null) {
                            effectivePrice = baseForPax + rp.price;
                        }
                    }

                    if (effectivePrice == null || effectivePrice <= 0) {
                        continue;
                    }

                    const current = ruleMap.get(paxTypeId);

                    if (
                        !current ||
                        (rule.priority ?? 0) > (current.rule.priority ?? 0)
                    ) {
                        ruleMap.set(paxTypeId, {
                            effectivePrice,
                            rule,
                            rulePrice: rp,
                        });
                    }
                }
            }
        }

        const allPaxTypeIds = new Set<number>([
            ...basePriceMap.keys(),
            ...ruleMap.keys(),
        ]);

        const result: TourPaxTypePriceDto[] = [];

        for (const paxTypeId of allPaxTypeIds) {
            const base = basePriceMap.get(paxTypeId);
            const basePrice = base?.price ?? null;

            const ruleEntry = ruleMap.get(paxTypeId);
            const rulePrice = ruleEntry?.effectivePrice ?? null;

            let finalPrice: number | null = null;
            let priceSource: TourPaxTypePriceDto['priceSource'] = 'none';
            let priceLayer: TourPaxTypePriceDto['priceLayer'] = 'none';

            if (rulePrice != null && rulePrice > 0) {
                finalPrice = rulePrice;
                priceLayer = 'rule';
                priceSource =
                    ruleEntry!.rule.price_type === 'absolute'
                        ? 'rule_absolute'
                        : 'rule_delta';
            } else if (basePrice != null && basePrice > 0) {
                finalPrice = basePrice;
                priceLayer = 'base';
                priceSource = 'base';
            }

            const paxType =
                base?.paxType ??
                activeVariants
                    .flatMap((v) => v.tour_price_rules ?? [])
                    .flatMap((r) => r.tour_rule_pax_type_prices ?? [])
                    .find((rp) => rp.pax_type?.id === paxTypeId)?.pax_type;

            result.push({
                paxTypeId,
                paxTypeName: paxType?.name ?? '',
                minAge: paxType?.min_age ?? null,
                maxAge: paxType?.max_age ?? null,
                basePrice,
                rulePrice,
                finalPrice,
                priceSource,
                priceLayer,
            });
        }

        result.sort((a, b) => a.paxTypeId - b.paxTypeId);

        return result;
    }
}

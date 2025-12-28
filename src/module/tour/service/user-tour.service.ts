import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from '../entity/tour.entity';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
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
    UserTourSessionDTO,
    TourStatus,
} from '../dto/tour.dto';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { TourVariantEntity } from '../entity/tourVariant.entity';
import { TourSessionEntity } from '../entity/tourSession.entity';
import { PricingService } from '@/module/pricing/pricing.service';
import { PriceCacheService } from './price-cache.service';
import { DivisionEntity } from '@/common/entity/division.entity';

@Injectable()
export class UserTourService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(ReviewEntity)
        private readonly reviewRepository: Repository<ReviewEntity>,
        @InjectRepository(TourSessionEntity)
        private readonly sessionRepository: Repository<TourSessionEntity>,
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: Repository<DivisionEntity>,
        private readonly pricingService: PricingService,
        private readonly priceCacheService: PriceCacheService,
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
            .leftJoinAndSelect('tour.currency', 'currency')
            .leftJoinAndSelect(
                'tour.reviews',
                'reviews',
                'reviews.status = :reviewStatus',
                { reviewStatus: 'approved' },
            )
            .leftJoinAndSelect('tour.tour_categories', 'categories')
            .where('tour.status = :tourStatus', {
                tourStatus: TourStatus.active,
            })
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

        // Use cached price if available (for consistency with sorting)
        if (tour.cached_min_price) {
            currentPrice = Number(tour.cached_min_price);
            originalPrice = Math.round(currentPrice * 1.3);
        } else if (tour.variants && tour.variants.length > 0) {
            // Fallback: calculate from variants if cache is not set
            const allPrices: number[] = [];

            tour.variants
                .filter(
                    (v) =>
                        (v.status as unknown as TourStatus) ===
                        TourStatus.active,
                )
                .forEach((activeVariant) => {
                    if (
                        activeVariant.tour_variant_pax_type_prices?.length > 0
                    ) {
                        activeVariant.tour_variant_pax_type_prices
                            .filter((p) => p.price > 0)
                            .forEach((p) => allPrices.push(p.price));
                    }
                });

            if (allPrices.length > 0) {
                currentPrice = Math.min(...allPrices);
                originalPrice = Math.round(currentPrice * 1.3);
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
            currencySymbol: tour.currency?.symbol,
            currencyCode: tour.currency?.name,
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

        if (query.country_ids?.length || query.division_ids?.length) {
            qb.andWhere(
                new Brackets((locationQb) => {
                    if (query.country_ids?.length) {
                        locationQb.orWhere(
                            'tour.country_id IN (:...countryIds)',
                            {
                                countryIds: query.country_ids,
                            },
                        );
                    }
                    if (query.division_ids?.length) {
                        locationQb.orWhere(
                            'tour.division_id IN (:...divisionIds)',
                            {
                                divisionIds: query.division_ids,
                            },
                        );
                    }
                }),
            );

            // Increment view_count for searched divisions (fire and forget)
            if (query.division_ids?.length) {
                this.divisionRepository
                    .createQueryBuilder()
                    .update(DivisionEntity)
                    .set({ view_count: () => 'view_count + 1' })
                    .where({ id: In(query.division_ids) })
                    .execute()
                    .catch(() => { }); // Ignore errors
            }
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

        if (query.startDate || query.endDate || query.travelers) {
            const hasStartDate = query.startDate && query.startDate.trim() !== '';
            const hasEndDate = query.endDate && query.endDate.trim() !== '';

            const sessionFilter = `
                EXISTS (
                    SELECT 1 
                    FROM tour_sessions ts
                    INNER JOIN tour_variants tv ON tv.id = ts.tour_variant_id
                    WHERE tv.tour_id = tour.id
                      AND tv.status = 'active'
                      AND ts.status = 'open'
                      ${hasStartDate ? 'AND ts.session_date >= :startDate' : ''}
                      ${hasEndDate
                    ? 'AND DATE_ADD(ts.session_date, INTERVAL (COALESCE(tour.duration_days, 1) - 1) DAY) <= :endDate'
                    : ''
                }
                      ${query.travelers ? 'AND COALESCE(ts.capacity, tv.capacity_per_slot, 999) >= :travelers' : ''}
                )
            `;

            if (hasStartDate) qb.setParameter('startDate', query.startDate);
            if (hasEndDate) qb.setParameter('endDate', query.endDate);
            if (query.travelers) qb.setParameter('travelers', query.travelers);

            qb.andWhere(sessionFilter);
        }

        const offset = query.offset || 0;
        const limit = query.limit || 12;

        // Clone query for counting BEFORE applying sort/pagination
        const countQb = qb.clone();
        const total = await countQb.getCount();

        // Use cached_min_price for sorting (much faster than subquery)
        switch (query.sort) {
            case 'price_asc':
                // MySQL sorts NULLs first in ASC. To put NULLs last:
                // We can't use standard SQL standard NULLS LAST.
                // For now, just remove the invalid syntax.
                qb.orderBy('tour.cached_min_price', 'ASC');
                qb.addOrderBy('tour.created_at', 'DESC');
                break;
            case 'price_desc':
                qb.orderBy('tour.cached_min_price', 'DESC');
                qb.addOrderBy('tour.created_at', 'DESC');
                break;
            case 'rating_desc':
                qb.orderBy('tour.score_rating', 'DESC');
                qb.addOrderBy('tour.created_at', 'DESC');
                break;
            case 'newest':
                qb.orderBy('tour.created_at', 'DESC');
                break;
            default:
                qb.orderBy('tour.score_rating', 'DESC');
                qb.addOrderBy('tour.created_at', 'DESC');
        }

        qb.skip(offset).take(limit);

        const tours = await qb.getMany();

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
            .leftJoinAndSelect('variants.tour_policy', 'policy')
            .leftJoinAndSelect('policy.tour_policy_rules', 'rules')
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect('tour.currency', 'currency')
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
            .andWhere('tour.status = :status', { status: TourStatus.active })
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

        if (tour.cached_min_price) {
            currentPrice = Number(tour.cached_min_price);
            originalPrice = Math.round(currentPrice * 1.5);
        } else if (tour.variants && tour.variants.length > 0) {
            try {
                // Use PricingService to ensure price consistency with checkout
                const computedPrices = await this.computeTourPricing(tour);
                const prices = computedPrices
                    .map((p) => p.finalPrice)
                    .filter(
                        (p): p is number =>
                            p !== null && p !== undefined && p > 0,
                    );

                if (prices.length > 0) {
                    currentPrice = Math.min(...prices);
                    originalPrice = Math.round(currentPrice * 1.5);
                }
            } catch {
                // Fallback to basic calculation if pricing service fails
                const activeVariant = tour.variants.find(
                    (v) =>
                        (v.status as unknown as TourStatus) ===
                        TourStatus.active,
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

        const included: string[] = tour.included || [];
        const notIncluded: string[] = tour.not_included || [];

        let testimonial: TourTestimonialDTO | undefined;
        if (tour.testimonial && tour.testimonial.name) {
            testimonial = new TourTestimonialDTO({
                name: tour.testimonial.name,
                country: tour.testimonial.country,
                text: tour.testimonial.text,
            });
        } else if (tour.reviews && tour.reviews.length > 0) {
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
            language: tour.languages?.length
                ? tour.languages
                : ['English', 'Vietnamese'],
            duration: durationStr,
            capacity: capacity,
        });

        const activity: TourActivityDTO | undefined = tour.highlights
            ? new TourActivityDTO({
                title: tour.highlights.title,
                items: tour.highlights.items,
            })
            : tour.summary
                ? new TourActivityDTO({
                    title: 'What You Will Do',
                    items: [tour.summary],
                })
                : undefined;

        // Fire-and-forget: Update price cache in background when viewing tour detail
        // This ensures prices are always fresh without blocking the response
        void this.priceCacheService.updateTourPriceCache(tour.id);

        return new UserTourDetailDTO({
            id: tour.id,
            title: tour.title,
            slug: tour.slug,
            location,
            price: currentPrice,
            oldPrice: originalPrice,
            currencySymbol: tour.currency?.symbol,
            currencyCode: tour.currency?.name,
            rating: avgRating > 0 ? Math.round(avgRating) : 0,
            durationDays: tour.duration_days || 1,
            reviewCount: reviewsCount,
            score: avgRating,
            scoreLabel,
            staffScore: tour.staff_score || parseFloat(staffScore.toFixed(1)),
            images: images.length > 0 ? images : ['/assets/images/travel.jpg'],
            testimonial,
            mapUrl: tour.map_url || '',
            mapPreview:
                tour.map_preview ||
                (images.length > 0 ? images[0] : '/assets/images/travel.jpg'),
            description: tour.description || '',
            summary: tour.summary || '',
            activity,
            included,
            notIncluded,
            details,
            meetingPoint: tour.meeting_point || '',
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
                            policy: v.tour_policy
                                ? {
                                    ...v.tour_policy,
                                    supplier_id: v.tour_policy.supplier_id,
                                    rules: v.tour_policy.tour_policy_rules,
                                }
                                : undefined,
                        }),
                ) || [],
        });
    }

    async getTourReviews(slug: string): Promise<UserTourReviewDTO[]> {
        const tour = await this.tourRepository.findOne({
            where: { slug, status: TourStatus.active, is_visible: true },
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
            where: { slug, status: TourStatus.active, is_visible: true },
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
            .where('tour.status = :status', { status: TourStatus.active })
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
                    (v) =>
                        (v.status as unknown as TourStatus) ===
                        TourStatus.active,
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

    async getPricesBySlug(slug: string): Promise<TourPaxTypePriceDto[]> {
        const tour = await this.tourRepository.findOne({
            where: {
                slug,
                status: TourStatus.active,
                is_visible: true,
            },
            relations: [
                'variants',
                'variants.tour_variant_pax_type_prices',
                'variants.tour_variant_pax_type_prices.pax_type',
            ],
        });

        if (!tour) {
            throw new NotFoundException(
                `Tour with slug "${slug}" not found or inactive`,
            );
        }

        return this.computeTourPricing(tour);
    }

    async computeVariantPricing(
        variant: TourVariantEntity,
    ): Promise<TourPaxTypePriceDto[]> {
        const ctx = await this.pricingService.calculate({
            breakdown: [],
            meta: { variant },
        });

        return (ctx.meta?.priceResult as TourPaxTypePriceDto[]) ?? [];
    }

    async getTourSessions(
        slug: string,
        variantId: number,
        startDateStr?: string,
        endDateStr?: string,
    ): Promise<UserTourSessionDTO[]> {
        // Find variant to ensure it belongs to the tour and get capacity info
        const tour = await this.tourRepository.findOne({
            where: { slug, status: TourStatus.active },
            relations: [
                'variants',
                'variants.tour_variant_pax_type_prices',
                'variants.tour_variant_pax_type_prices.pax_type',
            ],
        });

        if (!tour) {
            throw new NotFoundException(`Tour with slug "${slug}" not found`);
        }

        const variant = tour.variants.find((v) => v.id === variantId);
        if (!variant) {
            throw new NotFoundException(
                `Variant ${variantId} not found in tour ${slug}`,
            );
        }

        // Determine date range
        const start = startDateStr ? new Date(startDateStr) : new Date();
        const end = endDateStr ? new Date(endDateStr) : new Date(start);
        if (!endDateStr) {
            end.setDate(end.getDate() + 60); // Default 60 days
        }

        // Query sessions
        const sessions = await this.sessionRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.tour_variant', 'variant')
            .leftJoinAndSelect('session.booking_items', 'booking_items')
            .leftJoinAndSelect('session.tour_inventory_holds', 'holds')
            .where('session.tour_variant_id = :variantId', { variantId })
            .andWhere('session.session_date >= :start', { start })
            .andWhere('session.session_date <= :end', { end })
            .orderBy('session.session_date', 'ASC')
            .getMany();

        // Calculate pricing (using variant base pricing for now as representative)
        const computedPrices = await this.computeVariantPricing(variant);
        const validPrices = computedPrices
            .map((p) => p.finalPrice)
            .filter((p): p is number => p !== null && p > 0);
        const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

        return sessions.map((session) => {
            // Capacity logic
            const totalCapacity =
                session.capacity ?? variant.capacity_per_slot ?? 0;
            const booked = (session.booking_items ?? []).reduce(
                (sum, item) => sum + (item.quantity || 0),
                0,
            );
            const held = (session.tour_inventory_holds ?? []).reduce(
                (sum, hold) =>
                    hold.expires_at && new Date(hold.expires_at) > new Date()
                        ? sum + (hold.quantity || 0)
                        : sum,
                0,
            );
            const available = Math.max(0, totalCapacity - booked - held);

            let status = session.status;
            if (status === 'open' && available <= 0) {
                status = 'full';
            }

            return new UserTourSessionDTO({
                id: session.id,
                date:
                    session.session_date instanceof Date
                        ? session.session_date.toISOString().split('T')[0]
                        : session.session_date, // TypeORM might return string for date type
                start_time:
                    session.start_time instanceof Date
                        ? session.start_time.toLocaleTimeString('en-GB', {
                            hour12: false,
                        })
                        : typeof session.start_time === 'string'
                            ? session.start_time
                            : undefined,
                end_time:
                    session.end_time instanceof Date
                        ? session.end_time.toLocaleTimeString('en-GB', {
                            hour12: false,
                        })
                        : typeof session.end_time === 'string'
                            ? session.end_time
                            : undefined,
                status,
                capacity_available: available,
                price: minPrice, // In future, apply date-specific pricing rules here
            });
        });
    }

    async computeTourPricing(tour: TourEntity): Promise<TourPaxTypePriceDto[]> {
        const ctx = await this.pricingService.calculate({
            breakdown: [],
            meta: { tour },
        });

        return (ctx.meta?.priceResult as TourPaxTypePriceDto[]) ?? [];
    }
}

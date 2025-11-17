import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TourEntity } from "../entity/tour.entity";
import { Repository } from "typeorm";
import { UserTourPopularDTO } from "../dto/tour.dto";

@Injectable()
export class UserTourService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
    ) {}

    async getPopularTours(limit: number = 8): Promise<UserTourPopularDTO[]> {
        const tours = await this.tourRepository
            .createQueryBuilder('tour')
            .leftJoinAndSelect('tour.images', 'images')
            .leftJoinAndSelect('tour.variants', 'variants')
            .leftJoinAndSelect('tour.division', 'division')
            .leftJoinAndSelect('tour.country', 'country')
            .leftJoinAndSelect('tour.reviews', 'reviews', 'reviews.status = :status', { status: 'approved' })
            .leftJoinAndSelect('variants.tour_variant_pax_type_prices', 'prices')
            .leftJoinAndSelect('tour.tour_categories', 'categories')
            .where('tour.status = :status', { status: 'active' })
            .andWhere('tour.is_visible = :isVisible', { isVisible: true })
            .orderBy('tour.score_rating', 'DESC')
            .addOrderBy('tour.created_at', 'DESC')
            .take(limit)
            .getMany();

        return tours.map((tour): UserTourPopularDTO => {
            const coverImage = tour.images?.find(img => img.is_cover) || tour.images?.[0];
            const imageUrl: string = coverImage?.image_url || '/assets/images/travel.jpg';

            const reviewsCount: number = tour.reviews?.length || 0;
            const avgRating: number = tour.score_rating || 0;

            let ratingText: string = 'Good';
            if (avgRating >= 9) ratingText = 'Excellent';
            else if (avgRating >= 8) ratingText = 'Very good';
            else if (avgRating >= 7) ratingText = 'Good';
            else if (avgRating >= 6) ratingText = 'Okay';

            const location: string = tour.division && tour.country 
                ? `${tour.division.name}, ${tour.country.name}`
                : tour.address;

            const minPax: number = tour.min_pax || 1;
            const maxPax: number = tour.max_pax || minPax + 2;
            const capacity: string = `${minPax}-${maxPax} people`;

            let currentPrice: number = 0;
            let originalPrice: number | undefined;

            if (tour.variants && tour.variants.length > 0) {
                const activeVariant = tour.variants.find(v => v.status === 'active');
                if (activeVariant && activeVariant.tour_variant_pax_type_prices?.length > 0) {
                    const prices: number[] = activeVariant.tour_variant_pax_type_prices
                        .map(p => p.price)
                        .filter(p => p > 0);
                    
                    if (prices.length > 0) {
                        currentPrice = Math.min(...prices);
                        originalPrice = Math.round(currentPrice * 1.3);
                    }
                }
            }

            const tags: string[] = tour.tour_categories?.map(cat => cat.name) || [];

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
            });
        });
    }
}
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ReviewImageEntity } from '../entity/reviewImage.entity';
import {
    CreateReviewUserDTO,
    AdminReviewDTO,
    ReviewImageDTO,
    ReviewSummaryDTO,
    ReviewDetailDTO,
    ReviewImageDetailDTO,
    ReviewStatus,
    ReviewStatsDTO,
} from '../dto/review.dto';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { ReviewEntity } from '../entity/review.entity';
import { ReviewHelpfulEntity } from '../entity/reviewHelpful.entity';

export class ReviewService {
    constructor(
        @InjectRepository(ReviewEntity)
        private readonly reviewRepository: Repository<ReviewEntity>,
        @InjectRepository(ReviewImageEntity)
        private readonly imageRepository: Repository<ReviewImageEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(ReviewHelpfulEntity)
        private readonly helpfulRepository: Repository<ReviewHelpfulEntity>,
    ) {}

    async getAllReviews(currentUserId?: number): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            relations: ['user', 'tour', 'helpful_votes', 'helpful_votes.user'],
            order: { created_at: 'DESC' },
        });
        return reviews.map(
            (r) =>
                new ReviewSummaryDTO({
                    id: r.id,
                    title: r.title,
                    rating: r.rating,
                    status: r.status as ReviewStatus,
                    user_id: r.user?.id,
                    tour_id: r.tour?.id,
                    content: r.content,
                    user: {
                        id: r.user?.id,
                        full_name: r.user?.full_name,
                    },
                    tour: {
                        id: r.tour?.id,
                        title: r.tour?.title,
                    },
                    helpful_count: r.helpful_count,
                    is_reported: r.is_reported,
                    is_helpful: currentUserId
                        ? r.helpful_votes?.some(
                              (v) => v.user?.id === currentUserId,
                          )
                        : false,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    deleted_at: r.deleted_at ?? undefined,
                } as Partial<ReviewSummaryDTO>),
        );
    }

    async getReviewsByTour(
        tourId: number,
        currentUserId?: number,
    ): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            where: { tour: { id: tourId } },
            relations: ['user', 'tour', 'helpful_votes', 'helpful_votes.user'],
            order: { created_at: 'DESC' },
        });
        return reviews.map(
            (r) =>
                new ReviewSummaryDTO({
                    id: r.id,
                    title: r.title,
                    rating: r.rating,
                    status: r.status as ReviewStatus,
                    user_id: r.user?.id,
                    tour_id: r.tour?.id,
                    content: r.content,
                    user: {
                        id: r.user?.id,
                        full_name: r.user?.full_name,
                    },
                    tour: {
                        id: r.tour?.id,
                        title: r.tour?.title,
                    },
                    helpful_count: r.helpful_count,
                    is_reported: r.is_reported,
                    is_helpful: currentUserId
                        ? r.helpful_votes?.some(
                              (v) => v.user?.id === currentUserId,
                          )
                        : false,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    deleted_at: r.deleted_at ?? undefined,
                } as Partial<ReviewSummaryDTO>),
        );
    }

    async getReviewsByUser(
        userId: number,
        currentUserId?: number,
    ): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'tour', 'helpful_votes', 'helpful_votes.user'],
            order: { created_at: 'DESC' },
        });
        return reviews.map(
            (r) =>
                new ReviewSummaryDTO({
                    id: r.id,
                    title: r.title,
                    rating: r.rating,
                    status: r.status as ReviewStatus,
                    user_id: r.user?.id,
                    tour_id: r.tour?.id,
                    content: r.content,
                    user: {
                        id: r.user?.id,
                        full_name: r.user?.full_name,
                    },
                    tour: {
                        id: r.tour?.id,
                        title: r.tour?.title,
                    },
                    helpful_count: r.helpful_count,
                    is_reported: r.is_reported,
                    is_helpful: currentUserId
                        ? r.helpful_votes?.some(
                              (v) => v.user?.id === currentUserId,
                          )
                        : false,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    deleted_at: r.deleted_at ?? undefined,
                } as Partial<ReviewSummaryDTO>),
        );
    }

    async getReviewById(
        id: number,
        currentUserId?: number,
    ): Promise<ReviewDetailDTO | null> {
        const r = await this.reviewRepository.findOne({
            where: { id },
            relations: [
                'user',
                'tour',
                'images',
                'helpful_votes',
                'helpful_votes.user',
            ],
        });
        if (!r) return null;
        return new ReviewDetailDTO({
            id: r.id,
            title: r.title,
            rating: r.rating,
            status: r.status as ReviewStatus,
            user_id: r.user?.id,
            tour_id: r.tour?.id,
            content: r.content,
            helpful_count: r.helpful_count,
            is_reported: r.is_reported,
            is_helpful: currentUserId
                ? r.helpful_votes?.some((v) => v.user?.id === currentUserId)
                : false,
            sort_no: r.sort_no ?? 0,
            created_at: r.created_at,
            updated_at: r.updated_at,
            deleted_at: r.deleted_at ?? undefined,
            images: (r.images ?? []).map(
                (img) =>
                    new ReviewImageDetailDTO({
                        id: img.id,
                        image_url: img.image_url,
                        sort_no: img.sort_no ?? 0,
                        is_visible: !!img.is_visible,
                    }),
            ),
        } as Partial<ReviewDetailDTO>);
    }

    async create(
        userId: number,
        dto: CreateReviewUserDTO,
    ): Promise<ReviewDetailDTO> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const tour = await this.tourRepository.findOne({
            where: { id: dto.tour_id },
        });
        const item = this.reviewRepository.create({
            user,
            tour,
            title: dto.title,
            rating: dto.rating,
            content: dto.content,
            sort_no: dto.sort_no ?? null,
            status: (dto.status ?? ReviewStatus.pending) as string,
        } as DeepPartial<ReviewEntity>);
        const review = await this.reviewRepository.save(item);
        if (dto.images?.length) {
            const imgs = dto.images.map((i: ReviewImageDTO) =>
                this.imageRepository.create({
                    image_url: i.image_url,
                    sort_no: i.sort_no ?? 0,
                    is_visible: i.is_visible ?? false,
                    review,
                }),
            );
            await this.imageRepository.save(imgs);
        }
        return (await this.getReviewById(review.id)) as ReviewDetailDTO;
    }

    async update(
        id: number,
        dto: Partial<AdminReviewDTO>,
    ): Promise<ReviewDetailDTO | null> {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) return null;
        review.title = dto.title ?? review.title;
        review.rating = dto.rating ?? review.rating;
        review.content = dto.content ?? review.content;
        review.sort_no = dto.sort_no ?? review.sort_no;
        review.status = (dto.status ??
            (review.status as ReviewStatus)) as string;
        if (dto.user_id) review.user = { id: dto.user_id } as UserEntity;
        if (dto.tour_id) review.tour = { id: dto.tour_id } as TourEntity;
        await this.reviewRepository.save(review);
        return this.getReviewById(id);
    }

    async remove(id: number): Promise<boolean> {
        const res = await this.reviewRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async addImages(
        reviewId: number,
        images: ReviewImageDTO[],
    ): Promise<ReviewImageDetailDTO[]> {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) return [];
        const entities = images.map((i) =>
            this.imageRepository.create({
                image_url: i.image_url,
                sort_no: i.sort_no ?? 0,
                is_visible: i.is_visible ?? false,
                review,
            }),
        );
        const saved = await this.imageRepository.save(entities);
        return saved.map(
            (s) =>
                new ReviewImageDetailDTO({
                    id: s.id,
                    image_url: s.image_url,
                    sort_no: s.sort_no ?? undefined,
                    is_visible: !!s.is_visible,
                }),
        );
    }

    async removeImage(imageId: number): Promise<boolean> {
        const res = await this.imageRepository.delete({ id: imageId });
        return (res.affected ?? 0) > 0;
    }

    async updateStatus(
        id: number,
        status: ReviewStatus,
    ): Promise<ReviewDetailDTO | null> {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) return null;
        review.status = status as string;
        await this.reviewRepository.save(review);
        return this.getReviewById(id);
    }
    async findOne(id: number): Promise<ReviewEntity> {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) throw new Error('Review not found');
        return review;
    }

    async save(review: ReviewEntity): Promise<ReviewEntity> {
        return this.reviewRepository.save(review);
    }

    async toggleHelpful(id: number, userId: number): Promise<ReviewEntity> {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) throw new Error('Review not found');

        const existing = await this.helpfulRepository.findOne({
            where: { review: { id }, user: { id: userId } },
        });

        if (existing) {
            await this.helpfulRepository.remove(existing);
            review.helpful_count = Math.max(0, review.helpful_count - 1);
        } else {
            const newVote = this.helpfulRepository.create({
                review: { id },
                user: { id: userId },
            });
            await this.helpfulRepository.save(newVote);
            review.helpful_count += 1;
        }

        return this.reviewRepository.save(review);
    }

    async getStats(): Promise<ReviewStatsDTO> {
        const reviews = await this.reviewRepository.find();
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = total > 0 ? sum / total : 0;

        const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            const rounded = Math.round(r.rating);
            if (ratingBreakdown[rounded] !== undefined) {
                ratingBreakdown[rounded]++;
            }
        });

        const statusBreakdown = {
            [ReviewStatus.pending]: 0,
            [ReviewStatus.approved]: 0,
            [ReviewStatus.rejected]: 0,
        };
        reviews.forEach((r) => {
            if (statusBreakdown[r.status] !== undefined) {
                statusBreakdown[r.status]++;
            }
        });

        return new ReviewStatsDTO({
            total_reviews: total,
            average_rating: parseFloat(avg.toFixed(2)),
            rating_breakdown: ratingBreakdown,
            status_breakdown: statusBreakdown,
        });
    }
}

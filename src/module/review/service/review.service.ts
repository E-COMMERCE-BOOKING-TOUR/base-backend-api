import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ReviewImageEntity } from '../entity/reviewImage.entity';
import {
    ReviewDTO,
    ReviewImageDTO,
    ReviewSummaryDTO,
    ReviewDetailDTO,
    ReviewImageDetailDTO,
    ReviewStatus,
} from '../dto/review.dto';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { ReviewEntity } from '../entity/review.entity';

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
    ) {}

    async getAllReviews(): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            relations: ['user', 'tour'],
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
                }),
        );
    }

    async getReviewsByTour(tourId: number): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            where: { tour: { id: tourId } },
            relations: ['user', 'tour'],
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
                }),
        );
    }

    async getReviewsByUser(userId: number): Promise<ReviewSummaryDTO[]> {
        const reviews = await this.reviewRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'tour'],
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
                }),
        );
    }

    async getReviewById(id: number): Promise<ReviewDetailDTO | null> {
        const r = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'tour', 'images'],
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
            sort_no: r.sort_no ?? undefined,
            images: (r.images ?? []).map(
                (img) =>
                    new ReviewImageDetailDTO({
                        id: img.id,
                        image_url: img.image_url,
                        sort_no: img.sort_no ?? undefined,
                        is_visible: !!img.is_visible,
                    }),
            ),
        });
    }

    async create(dto: ReviewDTO): Promise<ReviewDetailDTO> {
        const user = await this.userRepository.findOne({
            where: { id: dto.user_id },
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
        dto: Partial<ReviewDTO>,
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
}

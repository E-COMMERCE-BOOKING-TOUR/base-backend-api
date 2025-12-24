import { Injectable } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewUserDTO, ReviewDetailDTO } from '../dto/review.dto';

@Injectable()
export class UserReviewService {
    constructor(private readonly reviewService: ReviewService) { }

    async create(userId: number, dto: CreateReviewUserDTO): Promise<ReviewDetailDTO> {
        return this.reviewService.create(userId, dto);
    }

    async getReviewsByTour(tourId: number, currentUserId?: number) {
        return this.reviewService.getReviewsByTour(tourId, currentUserId);
    }

    async getReviewById(id: number) {
        return this.reviewService.findOne(id);
    }

    async markHelpful(id: number, userId: number) {
        return this.reviewService.toggleHelpful(id, userId);
    }

    async reportReview(id: number) {
        const review = await this.reviewService.findOne(id);
        review.is_reported = true;
        return this.reviewService.save(review);
    }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from '../service/review.service';
import {
    ReviewDTO,
    ReviewImageDTO,
    ReviewSummaryDTO,
    ReviewDetailDTO,
    ReviewImageDetailDTO,
    ReviewStatus,
} from '../dto/review.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllReviews() {
        return await this.reviewService.getAllReviews();
    }

    @Post('getAllByTour')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getReviewsByTour(@Body() tourId: number) {
        return await this.reviewService.getReviewsByTour(tourId);
    }

    @Post('getAllByUser')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getReviewsByUser(@Body() userId: number) {
        return await this.reviewService.getReviewsByUser(userId);
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getReviewById(@Body() id: number) {
        return await this.reviewService.getReviewById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(@Body() dto: ReviewDTO) {
        return await this.reviewService.create(dto);
    }

    @Post('update')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async update(@Body() payload: { id: number; data: Partial<ReviewDTO> }) {
        return await this.reviewService.update(payload.id, payload.data);
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Body() id: number) {
        return await this.reviewService.remove(id);
    }

    @Post('addImages')
    @ApiResponse({ status: 201, type: [ReviewImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addImages(
        @Body() payload: { reviewId: number; images: ReviewImageDTO[] },
    ) {
        return await this.reviewService.addImages(
            payload.reviewId,
            payload.images,
        );
    }

    @Post('removeImage')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeImage(@Body() imageId: number) {
        return await this.reviewService.removeImage(imageId);
    }

    @Post('updateStatus')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateStatus(@Body() payload: { id: number; status: ReviewStatus }) {
        return await this.reviewService.updateStatus(
            payload.id,
            payload.status,
        );
    }
}

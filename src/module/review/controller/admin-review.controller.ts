import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ReviewService } from '../service/review.service';
import {
    AdminReviewDTO,
    ReviewImageDTO,
    ReviewSummaryDTO,
    ReviewDetailDTO,
    ReviewImageDetailDTO,
    ReviewStatus,
    ReviewStatsDTO,
} from '../dto/review.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';

@ApiTags('Admin Review')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/review')
export class AdminReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllReviews(@User() user: UserEntity) {
        return await this.reviewService.getAllReviews(user.id);
    }

    @Post('getAllByTour/:tourId')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'tourId', type: Number, example: 1 })
    async getReviewsByTour(
        @Param('tourId') tourId: number,
        @User() user: UserEntity,
    ) {
        return await this.reviewService.getReviewsByTour(tourId, user.id);
    }

    @Post('getAllByUser/:userId')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getReviewsByUser(
        @Param('userId') userId: number,
        @User() user: UserEntity,
    ) {
        return await this.reviewService.getReviewsByUser(userId, user.id);
    }

    @Post('getById/:id')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getReviewById(@Param('id') id: number) {
        return await this.reviewService.getReviewById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: AdminReviewDTO })
    async create(@Body() dto: AdminReviewDTO) {
        return await this.reviewService.create(dto.user_id, dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: AdminReviewDTO })
    async update(
        @Param('id') id: number,
        @Body() payload: Partial<AdminReviewDTO>,
    ) {
        return await this.reviewService.update(id, payload);
    }

    @Post('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async remove(@Param('id') id: number) {
        return await this.reviewService.remove(id);
    }

    @Post('addImages/:id')
    @ApiResponse({ status: 201, type: [ReviewImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async addImages(
        @Param('id') id: number,
        @Body() payload: { reviewId: number; images: ReviewImageDTO[] },
    ) {
        return await this.reviewService.addImages(
            payload.reviewId,
            payload.images,
        );
    }

    @Delete('removeImage/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async removeImage(@Param('id') imageId: number) {
        return await this.reviewService.removeImage(imageId);
    }

    @Post('updateStatus/:id')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: Object })
    async updateStatus(
        @Param('id') id: number,
        @Body() payload: { status: ReviewStatus },
    ) {
        return await this.reviewService.updateStatus(id, payload.status);
    }
    @Post('toggleVisibility/:id')
    @ApiResponse({ status: 200, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async toggleVisibility(@Param('id') id: number) {
        // Toggle visibility by checking current status then switching
        // For simplicity, let's assume 'approved' is visible and 'pending'/'rejected' is hidden or just use a specific logic.
        // However, user asked for Hide/Show, which usually implies a separate flag or specific status.
        // Let's use status: approved = visible, rejected = hidden.
        const review = await this.reviewService.getReviewById(id);
        if (!review) return null;
        const newStatus =
            review.status === ReviewStatus.approved
                ? ReviewStatus.rejected
                : ReviewStatus.approved;
        return await this.reviewService.updateStatus(id, newStatus);
    }

    @Get('stats')
    @ApiResponse({ status: 200, type: ReviewStatsDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getStats() {
        return await this.reviewService.getStats();
    }
}

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
    async getAllReviews() {
        return await this.reviewService.getAllReviews();
    }

    @Post('getAllByTour/:tourId')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'tourId', type: Number, example: 1 })
    async getReviewsByTour(@Param('tourId') tourId: number) {
        return await this.reviewService.getReviewsByTour(tourId);
    }

    @Post('getAllByUser/:userId')
    @ApiResponse({ status: 201, type: [ReviewSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getReviewsByUser(@Param('userId') userId: number) {
        return await this.reviewService.getReviewsByUser(userId);
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
    @ApiBody({ type: ReviewDTO })
    async create(@Body() dto: ReviewDTO) {
        return await this.reviewService.create(dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: ReviewDTO })
    async update(@Param('id') id: number, @Body() payload: Partial<ReviewDTO>) {
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
}

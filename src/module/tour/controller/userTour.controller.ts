import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { UserTourService } from "../service/userTour.service";
import { 
    UserTourPopularDTO, 
    UserTourDetailDTO, 
    UserTourReviewDTO, 
    UserTourReviewCategoryDTO,
    UserTourRelatedDTO,
    UserTourSearchQueryDTO
} from "../dto/tour.dto";

@ApiTags('User Tour')
@Controller('user/tour')
export class UserTourController {
    constructor(private readonly userTourService: UserTourService) {}
    @Get('search/list')
    @ApiOperation({ summary: 'Search tours with filters' })
    @ApiResponse({
        status: 200,
        description: 'Filtered tour list',
        schema: {
            properties: {
                data: { type: 'array', items: { $ref: getSchemaPath(UserTourPopularDTO) } },
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
            },
        },
    })
    async searchTours(@Query() query: UserTourSearchQueryDTO) {
        return this.userTourService.searchTours(query);
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular tours' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of tours to return', example: 8 })
    @ApiResponse({
        status: 200,
        description: 'List of popular tours',
        type: [UserTourPopularDTO],
    })
    async getPopularTours(@Query('limit') limit?: string): Promise<UserTourPopularDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 8;
        return this.userTourService.getPopularTours(limitNum);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get tour detail by slug' })
    @ApiParam({ name: 'slug', type: String, description: 'Tour slug' })
    @ApiResponse({
        status: 200,
        description: 'Tour detail',
        type: UserTourDetailDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Tour not found',
    })
    async getTourDetailBySlug(@Param('slug') slug: string): Promise<UserTourDetailDTO> {
        return this.userTourService.getTourDetailBySlug(slug);
    }

    @Get(':slug/reviews')
    @ApiOperation({ summary: 'Get tour reviews' })
    @ApiParam({ name: 'slug', type: String, description: 'Tour slug' })
    @ApiResponse({
        status: 200,
        description: 'List of tour reviews',
        type: [UserTourReviewDTO],
    })
    @ApiResponse({
        status: 404,
        description: 'Tour not found',
    })
    async getTourReviews(@Param('slug') slug: string): Promise<UserTourReviewDTO[]> {
        return this.userTourService.getTourReviews(slug);
    }

    @Get(':slug/review-categories')
    @ApiOperation({ summary: 'Get tour review categories' })
    @ApiParam({ name: 'slug', type: String, description: 'Tour slug' })
    @ApiResponse({
        status: 200,
        description: 'List of review categories with scores',
        type: [UserTourReviewCategoryDTO],
    })
    @ApiResponse({
        status: 404,
        description: 'Tour not found',
    })
    async getTourReviewCategories(@Param('slug') slug: string): Promise<UserTourReviewCategoryDTO[]> {
        return this.userTourService.getTourReviewCategories(slug);
    }

    @Get(':slug/related')
    @ApiOperation({ summary: 'Get related tours' })
    @ApiParam({ name: 'slug', type: String, description: 'Tour slug' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of related tours to return', example: 8 })
    @ApiResponse({
        status: 200,
        description: 'List of related tours',
        type: [UserTourRelatedDTO],
    })
    @ApiResponse({
        status: 404,
        description: 'Tour not found',
    })
    async getRelatedTours(
        @Param('slug') slug: string,
        @Query('limit') limit?: string
    ): Promise<UserTourRelatedDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 8;
        return this.userTourService.getRelatedTours(slug, limitNum);
    }
}
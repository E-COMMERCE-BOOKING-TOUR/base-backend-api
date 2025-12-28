import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import { UserTourService } from '../service/user-tour.service';
import { JwtOptionalGuard } from '@/module/user/guard/jwt-optional.guard';
import {
    UserTourPopularDTO,
    UserTourDetailDTO,
    UserTourReviewDTO,
    UserTourReviewCategoryDTO,
    UserTourRelatedDTO,
    UserTourSearchQueryDTO,
    UserTourSessionDTO,
} from '../dto/tour.dto';

@ApiTags('User Tour')
@Controller('user/tour')
export class UserTourController {
    constructor(
        private readonly userTourService: UserTourService,
        @Inject('RECOMMEND_SERVICE') private readonly recommendClient: ClientProxy,
    ) { }
    @Get('search/list')
    @ApiOperation({ summary: 'Search tours with filters' })
    @ApiResponse({
        status: 200,
        description: 'Filtered tour list',
        schema: {
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(UserTourPopularDTO) },
                },
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
            },
        },
    })
    async searchTours(
        @Query() query: UserTourSearchQueryDTO,
    ): Promise<any> {
        return this.userTourService.searchTours(query);
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular tours' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of tours to return',
        example: 8,
    })
    @ApiResponse({
        status: 200,
        description: 'List of popular tours',
        type: [UserTourPopularDTO],
    })
    async getPopularTours(
        @Query('limit') limit?: string,
    ): Promise<UserTourPopularDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 8;
        return this.userTourService.getPopularTours(limitNum);
    }

    @Get(':slug')
    @UseGuards(JwtOptionalGuard)
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
    async getTourDetailBySlug(
        @Param('slug') slug: string,
        @Req() req: any,
        @Query('guest_id') guestId?: string,
    ): Promise<UserTourDetailDTO> {
        const tour = await this.userTourService.getTourDetailBySlug(slug);

        // Track view interaction
        const userId = req.user?.id?.toString();
        this.recommendClient.emit({ cmd: 'track_interaction' }, {
            userId,
            guestId,
            tourId: tour.id,
            type: 'view',
        });

        return tour;
    }

    @Post('favorite/toggle')
    @UseGuards(JwtOptionalGuard)
    @ApiOperation({ summary: 'Toggle favorite status of a tour' })
    async toggleFavorite(
        @Body() data: { tour_id: number; guest_id?: string },
        @Req() req: any,
    ): Promise<any> {
        const userId = req.user?.id?.toString();
        return this.recommendClient.send({ cmd: 'toggle_favorite' }, {
            userId,
            guestId: data.guest_id,
            tourId: data.tour_id,
        });
    }

    @Get('recommend/list')
    @UseGuards(JwtOptionalGuard)
    @ApiOperation({ summary: 'Get recommended tours for user' })
    @ApiQuery({ name: 'guest_id', required: false })
    async getRecommendations(
        @Req() req: any,
        @Query('guest_id') guestId?: string,
    ): Promise<UserTourPopularDTO[]> {
        const userId = req.user?.id?.toString();
        return this.userTourService.getRecommendations(userId, guestId);
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
    async getTourReviews(
        @Param('slug') slug: string,
    ): Promise<UserTourReviewDTO[]> {
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
    async getTourReviewCategories(
        @Param('slug') slug: string,
    ): Promise<UserTourReviewCategoryDTO[]> {
        return this.userTourService.getTourReviewCategories(slug);
    }

    @Get(':slug/related')
    @ApiOperation({ summary: 'Get related tours' })
    @ApiParam({ name: 'slug', type: String, description: 'Tour slug' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of related tours to return',
        example: 8,
    })
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
        @Query('limit') limit?: string,
    ): Promise<UserTourRelatedDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 8;
        return this.userTourService.getRelatedTours(slug, limitNum);
    }

    @Get(':slug/sessions')
    @ApiOperation({ summary: 'Get tour sessions availability' })
    @ApiParam({ name: 'slug', type: String })
    @ApiQuery({ name: 'variant_id', type: Number, required: true })
    @ApiQuery({ name: 'start_date', type: String, required: false })
    @ApiQuery({ name: 'end_date', type: String, required: false })
    @ApiResponse({
        status: 200,
        description: 'List of tour sessions',
        type: [UserTourSessionDTO],
    })
    async getTourSessions(
        @Param('slug') slug: string,
        @Query('variant_id') variantId: string,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ): Promise<UserTourSessionDTO[]> {
        return this.userTourService.getTourSessions(
            slug,
            parseInt(variantId, 10),
            startDate,
            endDate,
        );
    }
}

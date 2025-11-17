import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserTourService } from "../service/userTour.service";
import { UserTourPopularDTO } from "../dto/tour.dto";

@ApiTags('User Tour')
@Controller('user/tour')
export class UserTourController {
    constructor(private readonly userTourService: UserTourService) {}

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
}
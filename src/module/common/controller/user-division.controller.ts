import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DivisionService } from '../service/division.service';
import { UserDivisionTrendingDTO } from '../dto/division.dto';

@ApiTags('User Division')
@Controller('user/division')
export class UserDivisionController {
    constructor(private readonly divisionService: DivisionService) {}

    @Get('trending')
    @ApiOperation({ summary: 'Get trending destinations' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of destinations to return',
        example: 6,
    })
    @ApiResponse({
        status: 200,
        description: 'List of trending destinations',
        type: [UserDivisionTrendingDTO],
    })
    async getTrendingDestinations(
        @Query('limit') limit?: string,
    ): Promise<UserDivisionTrendingDTO[]> {
        const limitNum: number = limit ? parseInt(limit, 10) : 6;
        return this.divisionService.getTrendingDestinations(limitNum);
    }
}

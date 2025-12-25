import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DivisionService } from '../service/division.service';
import { UserDivisionTrendingDTO } from '../dto/division.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';

@ApiTags('User Division')
@Controller('user/division')
export class UserDivisionController {
    constructor(
        private readonly divisionService: DivisionService,
        @InjectRepository(CountryEntity)
        private readonly countryRepository: Repository<CountryEntity>,
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: Repository<DivisionEntity>,
    ) { }

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

    @Get('countries')
    @ApiOperation({ summary: 'Get all countries' })
    @ApiResponse({
        status: 200,
        description: 'List of all countries',
    })
    async getCountries() {
        return this.countryRepository.find({ order: { name: 'ASC' } });
    }

    @Get('all')
    @ApiOperation({ summary: 'Get all divisions' })
    @ApiResponse({
        status: 200,
        description: 'List of all divisions with country relation',
    })
    async getAllDivisions() {
        return this.divisionRepository.find({
            relations: ['country'],
            order: { level: 'ASC', name: 'ASC' },
        });
    }
}

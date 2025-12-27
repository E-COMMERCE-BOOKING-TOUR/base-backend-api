import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminTourService } from '../service/admin-tour.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { PriceCacheService } from '../service/price-cache.service';
import {
    AdminTourQueryDTO,
    PaginatedTourResponse,
    TourDTO,
    TourPolicyDTO,
} from '../dto/tour.dto';
import { TourEntity } from '../entity/tour.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';

@ApiTags('Admin Tour')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/tour')
export class AdminTourController {
    constructor(
        private readonly adminTourService: AdminTourService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly priceCacheService: PriceCacheService,
    ) { }

    @Post('refresh-price-cache')
    @ApiOperation({ summary: 'Manually refresh price cache for all tours' })
    @ApiResponse({
        status: 200,
        description: 'Price cache refresh result',
        schema: {
            properties: {
                message: { type: 'string' },
            }
        }
    })
    async refreshPriceCache() {
        return this.priceCacheService.updateAllTourPriceCache();
    }

    @Post('refresh-price-cache/:id')
    @ApiOperation({ summary: 'Refresh price cache for a specific tour' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Price cache updated' })
    async refreshTourPriceCache(@Param('id') id: number) {
        await this.priceCacheService.updateTourPriceCache(id);
        return { success: true, message: `Price cache updated for tour ${id}` };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.cloudinaryService.uploadFile(file);
    }

    @Get('getAll')
    @ApiResponse({ status: 200, type: PaginatedTourResponse })
    async getAllTours(@Query() query: AdminTourQueryDTO) {
        return this.adminTourService.getAllTours(query);
    }

    @Get('metadata/countries')
    async getCountries() {
        return this.adminTourService.getCountries();
    }

    @Get('metadata/divisions/:countryId')
    async getDivisionsByCountry(@Param('countryId') countryId: number) {
        return this.adminTourService.getDivisionsByCountry(countryId);
    }

    @Get('metadata/currencies')
    async getCurrencies() {
        return this.adminTourService.getCurrencies();
    }

    @Get('policies/:supplierId')
    @ApiParam({ name: 'supplierId', type: Number })
    async getPoliciesBySupplier(@Param('supplierId') supplierId: number) {
        return this.adminTourService.getPoliciesBySupplier(supplierId);
    }

    @Get('getById/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: TourEntity })
    async getTourById(@Param('id') id: number) {
        return this.adminTourService.getTourById(id);
    }

    @Get('visibility-check/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiOperation({ summary: 'Check why a tour is visible or hidden' })
    async getVisibilityReport(@Param('id') id: number) {
        return this.adminTourService.getVisibilityReport(id);
    }

    @Post('create')
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 201, type: TourEntity })
    async createTour(@Body() dto: TourDTO) {
        return this.adminTourService.createTour(dto);
    }

    @Put('update/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 200, type: TourEntity })
    async updateTour(@Param('id') id: number, @Body() dto: Partial<TourDTO>) {
        return this.adminTourService.updateTour(id, dto);
    }

    @Patch('status/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: { type: 'object', properties: { status: { type: 'string' } } },
    })
    async updateStatus(
        @Param('id') id: number,
        @Body('status') status: string,
    ) {
        return this.adminTourService.updateStatus(id, status);
    }

    @Delete('remove/:id')
    @ApiParam({ name: 'id', type: Number })
    async removeTour(@Param('id') id: number) {
        return this.adminTourService.removeTour(id);
    }

    // --- Policy Management ---

    @Post('policy')
    @ApiBody({ type: TourPolicyDTO })
    async createPolicy(@Body() dto: TourPolicyDTO) {
        return this.adminTourService.createPolicy(dto);
    }

    @Put('policy/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: TourPolicyDTO })
    async updatePolicy(@Param('id') id: number, @Body() dto: Partial<TourPolicyDTO>) {
        return this.adminTourService.updatePolicy(id, dto);
    }

    @Delete('policy/:id')
    @ApiParam({ name: 'id', type: Number })
    async removePolicy(@Param('id') id: number) {
        return this.adminTourService.removePolicy(id);
    }
}

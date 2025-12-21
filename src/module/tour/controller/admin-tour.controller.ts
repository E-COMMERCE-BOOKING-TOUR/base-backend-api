import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminTourService } from '../service/admin-tour.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import {
    TourDTO,
    TourImageDTO,
    TourVariantDTO,
    TourSessionDTO,
    TourVariantPaxTypePriceDTO,
} from '../dto/tour.dto';
import { TourEntity } from '../entity/tour.entity';
import { TourVariantEntity } from '../entity/tourVariant.entity';
import { TourSessionEntity } from '../entity/tourSession.entity';
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
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.cloudinaryService.uploadFile(file);
    }

    @Get('getAll')
    @ApiResponse({ status: 200, type: [TourEntity] })
    async getAllTours() {
        return this.adminTourService.getAllTours();
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

    @Get('getById/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: TourEntity })
    async getTourById(@Param('id') id: number) {
        return this.adminTourService.getTourById(id);
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

    @Delete('remove/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200 })
    async removeTour(@Param('id') id: number) {
        return this.adminTourService.removeTour(id);
    }

    // --- Variant ---

    @Post('addVariant/:tourId')
    @ApiParam({ name: 'tourId', type: Number })
    @ApiBody({ type: TourVariantDTO })
    async addVariant(@Param('tourId') tourId: number, @Body() dto: TourVariantDTO) {
        return this.adminTourService.addVariant(tourId, dto);
    }

    @Put('updateVariant/:variantId')
    @ApiParam({ name: 'variantId', type: Number })
    @ApiBody({ type: TourVariantDTO })
    async updateVariant(@Param('variantId') variantId: number, @Body() dto: Partial<TourVariantDTO>) {
        return this.adminTourService.updateVariant(variantId, dto);
    }

    @Delete('removeVariant/:variantId')
    @ApiParam({ name: 'variantId', type: Number })
    async removeVariant(@Param('variantId') variantId: number) {
        return this.adminTourService.removeVariant(variantId);
    }

    // --- Pricing ---

    @Post('setVariantPaxTypePrice')
    @ApiBody({ type: TourVariantPaxTypePriceDTO })
    async setVariantPaxTypePrice(@Body() dto: TourVariantPaxTypePriceDTO) {
        return this.adminTourService.setVariantPaxTypePrice(dto);
    }

    // --- Session ---

    @Post('addSession')
    @ApiBody({ type: TourSessionDTO })
    async addSession(@Body() dto: TourSessionDTO) {
        return this.adminTourService.addSession(dto);
    }

    @Post('bulkAddSessions')
    @ApiBody({ type: [TourSessionDTO] })
    async bulkAddSessions(@Body() dto: TourSessionDTO[]) {
        return this.adminTourService.bulkAddSessions(dto);
    }

    @Delete('removeSession/:sessionId')
    @ApiParam({ name: 'sessionId', type: Number })
    async removeSession(@Param('sessionId') sessionId: number) {
        return this.adminTourService.removeSession(sessionId);
    }
}

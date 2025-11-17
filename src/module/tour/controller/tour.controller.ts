import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TourService } from '../service/tour.service';
import {
    TourDTO,
    TourImageDTO,
    TourVariantDTO,
    TourSessionDTO,
    TourPolicyDTO,
    TourPriceRuleDTO,
    TourVariantPaxTypePriceDTO,
    TourSummaryDTO,
    TourDetailDTO,
    TourImageDetailDTO,
    TourVariantSummaryDTO,
} from '../dto/tour.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Tour')
@Controller('tour')
export class TourController {
    constructor(private readonly tourService: TourService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [TourSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllTours() {
        return await this.tourService.getAllTours();
    }

    @Post('getAllBySupplier')
    @ApiResponse({ status: 201, type: [TourSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getToursBySupplier(@Body() supplierId: number) {
        return await this.tourService.getToursBySupplier(supplierId);
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getTourById(@Body() id: number) {
        return await this.tourService.getTourById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async createTour(@Body() dto: TourDTO) {
        return await this.tourService.createTour(dto);
    }

    @Post('update')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateTour(@Body() payload: { id: number; data: Partial<TourDTO> }) {
        return await this.tourService.updateTour(payload.id, payload.data);
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeTour(@Body() id: number) {
        return await this.tourService.removeTour(id);
    }

    @Post('addImages')
    @ApiResponse({ status: 201, type: [TourImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addImages(
        @Body() payload: { tourId: number; images: TourImageDTO[] },
    ) {
        return await this.tourService.addImages(payload.tourId, payload.images);
    }

    @Post('removeImage')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeImage(@Body() imageId: number) {
        return await this.tourService.removeImage(imageId);
    }

    @Post('addVariant')
    @ApiResponse({ status: 201, type: TourVariantSummaryDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addVariant(@Body() dto: TourVariantDTO) {
        return await this.tourService.addVariant(dto);
    }

    @Post('updateVariant')
    @ApiResponse({ status: 201, type: TourVariantSummaryDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateVariant(
        @Body() payload: { id: number; data: Partial<TourVariantDTO> },
    ) {
        return await this.tourService.updateVariant(payload.id, payload.data);
    }

    @Post('removeVariant')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeVariant(@Body() id: number) {
        return await this.tourService.removeVariant(id);
    }

    @Post('addSession')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addSession(@Body() dto: TourSessionDTO) {
        return await this.tourService.addSession(dto);
    }

    @Post('updateSession')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateSession(
        @Body() payload: { id: number; data: Partial<TourSessionDTO> },
    ) {
        return await this.tourService.updateSession(payload.id, payload.data);
    }

    @Post('removeSession')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeSession(@Body() id: number) {
        return await this.tourService.removeSession(id);
    }

    @Post('setPolicy')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async setPolicy(@Body() dto: TourPolicyDTO) {
        return await this.tourService.setPolicy(dto);
    }

    @Post('updatePolicy')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updatePolicy(
        @Body() payload: { id: number; data: Partial<TourPolicyDTO> },
    ) {
        return await this.tourService.updatePolicy(payload.id, payload.data);
    }

    @Post('removePolicy')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removePolicy(@Body() id: number) {
        return await this.tourService.removePolicy(id);
    }

    @Post('addPriceRule')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addPriceRule(@Body() dto: TourPriceRuleDTO) {
        return await this.tourService.addPriceRule(dto);
    }

    @Post('updatePriceRule')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updatePriceRule(
        @Body() payload: { id: number; data: Partial<TourPriceRuleDTO> },
    ) {
        return await this.tourService.updatePriceRule(payload.id, payload.data);
    }

    @Post('removePriceRule')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removePriceRule(@Body() id: number) {
        return await this.tourService.removePriceRule(id);
    }

    @Post('setVariantPaxTypePrice')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async setVariantPaxTypePrice(@Body() dto: TourVariantPaxTypePriceDTO) {
        return await this.tourService.setVariantPaxTypePrice(dto);
    }
}

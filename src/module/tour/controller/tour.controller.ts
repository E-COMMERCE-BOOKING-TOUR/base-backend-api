import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    @ApiResponse({ status: 201, type: [TourDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllTours() {
        return await this.tourService.getAllTours();
    }

    @Post('getAllBySupplier/:supplierId')
    @ApiResponse({ status: 201, type: [TourSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'supplierId', type: Number, example: 1 })
    async getToursBySupplier(@Param('supplierId') supplierId: number) {
        return await this.tourService.getToursBySupplier(supplierId);
    }

    @Post('getById/:id')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getTourById(@Param('id') id: number) {
        return await this.tourService.getTourById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: TourDTO })
    async createTour(@Body() dto: TourDTO) {
        return await this.tourService.createTour(dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: TourDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: TourDTO })
    async updateTour(
        @Param('id') id: number,
        @Body() payload: Partial<TourDTO>,
    ) {
        return await this.tourService.updateTour(id, payload);
    }

    @Post('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async removeTour(@Param('id') id: number) {
        return await this.tourService.removeTour(id);
    }

    @Post('addImages/:tourId')
    @ApiResponse({ status: 201, type: [TourImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'tourId', type: Number, example: 1 })
    async addImages(
        @Param('tourId') tourId: number,
        @Body() payload: TourImageDTO[],
    ) {
        return await this.tourService.addImages(tourId, payload);
    }

    @Post('removeImage/:imageId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'imageId', type: Number, example: 1 })
    async removeImage(@Param('imageId') imageId: number) {
        return await this.tourService.removeImage(imageId);
    }

    @Post('addVariant/:tourId')
    @ApiResponse({ status: 201, type: TourVariantSummaryDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'tourId', type: Number, example: 1 })
    @ApiBody({ type: TourVariantDTO })
    async addVariant(
        @Param('tourId') tourId: number,
        @Body() dto: TourVariantDTO,
    ) {
        return await this.tourService.addVariant(tourId, dto);
    }

    @Post('updateVariant/:variantId')
    @ApiResponse({ status: 201, type: TourVariantSummaryDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'variantId', type: Number, example: 1 })
    @ApiBody({ type: TourVariantDTO })
    async updateVariant(
        @Param('variantId') variantId: number,
        @Body() payload: Partial<TourVariantDTO>,
    ) {
        return await this.tourService.updateVariant(variantId, payload);
    }

    @Delete('removeVariant/:variantId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'variantId', type: Number, example: 1 })
    async removeVariant(@Param('variantId') variantId: number) {
        return await this.tourService.removeVariant(variantId);
    }

    @Post('addSession')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: TourSessionDTO })
    async addSession(@Body() dto: TourSessionDTO) {
        return await this.tourService.addSession(dto);
    }

    @Post('updateSession/:sessionId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'sessionId', type: Number, example: 1 })
    @ApiBody({ type: TourSessionDTO })
    async updateSession(
        @Param('sessionId') sessionId: number,
        @Body() payload: Partial<TourSessionDTO>,
    ) {
        return await this.tourService.updateSession(sessionId, payload);
    }

    @Delete('removeSession/:sessionId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'sessionId', type: Number, example: 1 })
    async removeSession(@Param('sessionId') sessionId: number) {
        return await this.tourService.removeSession(sessionId);
    }

    @Post('setPolicy')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: TourPolicyDTO })
    async setPolicy(@Body() dto: TourPolicyDTO) {
        return await this.tourService.setPolicy(dto);
    }

    @Post('updatePolicy/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updatePolicy(
        @Param('id') id: number,
        @Body() payload: Partial<TourPolicyDTO>,
    ) {
        return await this.tourService.updatePolicy(id, payload);
    }

    @Delete('removePolicy/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async removePolicy(@Param('id') id: number) {
        return await this.tourService.removePolicy(id);
    }

    @Post('addPriceRule')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: TourPriceRuleDTO })
    async addPriceRule(@Body() dto: TourPriceRuleDTO) {
        return await this.tourService.addPriceRule(dto);
    }

    @Post('updatePriceRule/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: TourPriceRuleDTO })
    async updatePriceRule(
        @Param('id') id: number,
        @Body() payload: Partial<TourPriceRuleDTO>,
    ) {
        return await this.tourService.updatePriceRule(id, payload);
    }

    @Delete('removePriceRule/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async removePriceRule(@Param('id') id: number) {
        return await this.tourService.removePriceRule(id);
    }

    @Post('setVariantPaxTypePrice')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: TourVariantPaxTypePriceDTO })
    async setVariantPaxTypePrice(@Body() dto: TourVariantPaxTypePriceDTO) {
        return await this.tourService.setVariantPaxTypePrice(dto);
    }
}

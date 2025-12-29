import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import {
    ApiBody,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {
    BookingDetailDTO,
    BookingSummaryDTO,
    BookingDTO,
    BookingItemDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';

@ApiTags('Admin Booking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/booking')
export class AdminBookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllBooking() {
        return await this.bookingService.getAllBooking();
    }

    @Post('getById/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getBookingById(@Param('id') id: number) {
        return await this.bookingService.getBookingById(id);
    }

    @Post('getByUser/:userId')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getBookingsByUser(@Param('userId') userId: number) {
        return await this.bookingService.getBookingsByUser(userId);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: BookingDTO })
    async createBooking(@Body() dto: BookingDTO) {
        return await this.bookingService.createBooking(dto);
    }

    @Post('updateContact/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async updateContact(
        @Param('id') id: number,
        @Body()
        payload: {
            contact_name?: string;
            contact_email?: string;
            contact_phone?: string;
        },
    ) {
        return await this.bookingService.updateContact(id, {
            contact_name: payload.contact_name,
            contact_email: payload.contact_email,
            contact_phone: payload.contact_phone,
        });
    }

    @Post('updateStatus/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async updateStatus(
        @Param('id') id: number,
        @Body() payload: { status: BookingStatus },
    ) {
        return await this.bookingService.updateStatus(id, payload.status);
    }

    @Post('updatePaymentStatus/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async updatePaymentStatus(
        @Param('id') id: number,
        @Body() payload: { payment_status: PaymentStatus },
    ) {
        return await this.bookingService.updatePaymentStatus(
            id,
            payload.payment_status,
        );
    }

    @Post('addItem/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async addItem(
        @Param('id') id: number,
        @Body() payload: { item: BookingItemDTO },
    ) {
        return await this.bookingService.addItem(id, payload.item);
    }

    @Delete('removeItem/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 17 })
    async removeItem(@Param('id') id: number) {
        return await this.bookingService.removeItem(id);
    }

    @Post('changeItemQuantity/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async changeItemQuantity(
        @Param('id') id: number,
        @Body() payload: { item_id: number; quantity: number },
    ) {
        return await this.bookingService.changeItemQuantity(
            id,
            payload.quantity,
        );
    }

    @Delete('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async remove(@Param('id') id: number) {
        return await this.bookingService.removeBooking(id);
    }

    @Post('confirm/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async confirm(@Param('id') id: number) {
        return await this.bookingService.confirmBooking(id);
    }

    @Get('calculate-refund/:id')
    @ApiResponse({ status: 200, description: 'Calculate refund for booking' })
    @ApiParam({ name: 'id', type: Number })
    async calculateRefund(@Param('id') id: number) {
        return await this.bookingService.calculateRefund(id);
    }

    @Post('cancel/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async cancel(
        @Param('id') id: number,
        @Body() payload: { reason?: string },
    ) {
        return await this.bookingService.cancelBooking(id, payload.reason);
    }

    @Post('expire/:id')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async expire(@Param('id') id: number) {
        return await this.bookingService.expireBooking(id);
    }

    @Post('refund/:id')
    @ApiResponse({ status: 200, description: 'Process manual refund' })
    @ApiParam({ name: 'id', type: Number })
    async refund(
        @Param('id') id: number,
        @Body() payload: { amount?: number },
    ) {
        // Admin refund logic (to be implemented in BookingService)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.bookingService.processAdminRefund(id, payload.amount);
    }
}

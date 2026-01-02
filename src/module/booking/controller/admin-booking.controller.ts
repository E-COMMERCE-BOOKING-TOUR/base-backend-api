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
import { Permissions } from '@/module/user/decorator/permissions.decorator';
import { PermissionsGuard } from '@/module/user/guard/permissions.guard';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';

@ApiTags('Admin Booking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('admin/booking')
export class AdminBookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Get('getAll')
    @Permissions('booking:read')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllBooking(@User() user: UserEntity) {
        return await this.bookingService.getAllBooking(user);
    }

    @Post('getById/:id')
    @Permissions('booking:read')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getBookingById(@Param('id') id: number) {
        return await this.bookingService.getBookingById(id);
    }

    @Post('getByUser/:userId')
    @Permissions('booking:read')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getBookingsByUser(@Param('userId') userId: number) {
        return await this.bookingService.getBookingsByUser(userId);
    }

    @Post('create')
    @Permissions('booking:create')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: BookingDTO })
    async createBooking(@Body() dto: BookingDTO) {
        return await this.bookingService.createBooking(dto);
    }

    @Post('updateContact/:id')
    @Permissions('booking:update')
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
    @Permissions('booking:update')
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
    @Permissions('booking:update')
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
    @Permissions('booking:update')
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
    @Permissions('booking:update')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 17 })
    async removeItem(@Param('id') id: number) {
        return await this.bookingService.removeItem(id);
    }

    @Post('changeItemQuantity/:id')
    @Permissions('booking:update')
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
    @Permissions('booking:delete')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async remove(@Param('id') id: number) {
        return await this.bookingService.removeBooking(id);
    }

    @Post('confirm/:id')
    @Permissions('booking:confirm')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async confirm(@Param('id') id: number) {
        return await this.bookingService.confirmBooking(id);
    }

    @Get('calculate-refund/:id')
    @Permissions('booking:read')
    @ApiResponse({ status: 200, description: 'Calculate refund for booking' })
    @ApiParam({ name: 'id', type: Number })
    async calculateRefund(@Param('id') id: number) {
        return await this.bookingService.calculateRefund(id);
    }

    @Post('cancel/:id')
    @Permissions('booking:cancel')
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
    @Permissions('booking:expire')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: BookingDTO })
    async expire(@Param('id') id: number) {
        return await this.bookingService.expireBooking(id);
    }

    @Post('refund/:id')
    @Permissions('booking:refund')
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

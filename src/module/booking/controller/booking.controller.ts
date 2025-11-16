import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    BookingDetailDTO,
    BookingSummaryDTO,
    BookingDTO,
    BookingItemDTO,
    BookingStatus,
    PaymentStatus,
} from '../dto/booking.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllBooking() {
        return await this.bookingService.getAllBooking();
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getBookingById(@Body() id: number) {
        return await this.bookingService.getBookingById(id);
    }

    @Post('getByUser')
    @ApiResponse({ status: 201, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getBookingsByUser(@Body() userId: number) {
        return await this.bookingService.getBookingsByUser(userId);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async createBooking(@Body() dto: BookingDTO) {
        return await this.bookingService.createBooking(dto);
    }

    @Post('updateContact')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateContact(
        @Body()
        payload: {
            id: number;
            contact_name?: string;
            contact_email?: string;
            contact_phone?: string;
        },
    ) {
        return await this.bookingService.updateContact(payload.id, {
            contact_name: payload.contact_name,
            contact_email: payload.contact_email,
            contact_phone: payload.contact_phone,
        });
    }

    @Post('updateStatus')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updateStatus(@Body() payload: { id: number; status: BookingStatus }) {
        return await this.bookingService.updateStatus(
            payload.id,
            payload.status,
        );
    }

    @Post('updatePaymentStatus')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async updatePaymentStatus(
        @Body() payload: { id: number; payment_status: PaymentStatus },
    ) {
        return await this.bookingService.updatePaymentStatus(
            payload.id,
            payload.payment_status,
        );
    }

    @Post('addItem')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addItem(
        @Body() payload: { booking_id: number; item: BookingItemDTO },
    ) {
        return await this.bookingService.addItem(payload.booking_id);
    }

    @Post('removeItem')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeItem(@Body() itemId: number) {
        return await this.bookingService.removeItem(itemId);
    }

    @Post('changeItemQuantity')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async changeItemQuantity(
        @Body() payload: { item_id: number; quantity: number },
    ) {
        return await this.bookingService.changeItemQuantity(
            payload.item_id,
            payload.quantity,
        );
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Body() id: number) {
        return await this.bookingService.removeBooking(id);
    }

    @Post('confirm')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async confirm(@Body() id: number) {
        return await this.bookingService.confirmBooking(id);
    }

    @Post('cancel')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async cancel(@Body() id: number) {
        return await this.bookingService.cancelBooking(id);
    }

    @Post('expire')
    @ApiResponse({ status: 201, type: BookingDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async expire(@Body() id: number) {
        return await this.bookingService.expireBooking(id);
    }
}

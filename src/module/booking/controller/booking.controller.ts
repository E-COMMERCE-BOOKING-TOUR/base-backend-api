import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Get('getAll')
    async getAllBooking() {
        return await this.bookingService.getAllBooking();
    }

    @Post('getById')
    async getBookingById(@Body() id: number) {
        return await this.bookingService.getBookingById(id);
    }

    @Post('getByUser')
    async getBookingsByUser(@Body() userId: number) {
        return await this.bookingService.getBookingsByUser(userId);
    }
}

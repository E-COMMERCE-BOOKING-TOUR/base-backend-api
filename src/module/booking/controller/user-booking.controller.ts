import { Body, Controller, Param, Post, Get, UseFilters, UseGuards, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ConfirmBookingDTO } from '../dto/booking.dto';
import { UpdateBookingContactDto } from '../dto/update-booking-contact.dto';
import { UpdateBookingPaymentDto } from '../dto/update-booking-payment.dto';
import { UserBookingService } from '../service/user-booking.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtExceptionFilter } from '@/common/exceptions/jwt.exception';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserEntity } from '@/module/user/entity/user.entity';
import { User } from '@/module/user/decorator/user.decorator';

@ApiTags('User Booking')
@Controller('user/booking')
export class UserBookingController {
    constructor(private readonly userBookingService: UserBookingService) { }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    async createBooking(@User() user: UserEntity, @Body() dto: CreateBookingDto) {
        return await this.userBookingService.createBooking(user.uuid, dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('current')
    @ApiResponse({ status: 200, description: 'Get current active booking from session' })
    async getCurrentBooking(@User() user: UserEntity) {
        return await this.userBookingService.getCurrentBooking(user.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/contact-info')
    @ApiResponse({ status: 200, description: 'Update contact information for current booking' })
    async updateContactInfo(@User() user: UserEntity, @Body() dto: UpdateBookingContactDto) {
        return await this.userBookingService.updateBookingContact(user.uuid, dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/payment-method')
    @ApiResponse({ status: 200, description: 'Update payment method for current booking' })
    async updatePaymentMethod(@User() user: UserEntity, @Body() dto: UpdateBookingPaymentDto) {
        return await this.userBookingService.updateBookingPayment(user.uuid, dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/confirm')
    @ApiResponse({ status: 200, description: 'Confirm current booking' })
    async confirmCurrentBooking(@User() user: UserEntity) {
        return await this.userBookingService.confirmCurrentBooking(user.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('payment-methods')
    @ApiResponse({ status: 200, description: 'Get all active payment methods' })
    async getPaymentMethods(@User() user: UserEntity) {
        return await this.userBookingService.getPaymentMethods(user?.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    @ApiResponse({ status: 200, description: 'Get booking detail' })
    async getBookingDetail(@User() user: UserEntity, @Param('id') id: number) {
        return await this.userBookingService.getBookingDetail(id, user);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('confirm')
    @ApiResponse({ status: 200, description: 'Confirm booking (legacy)' })
    async confirmBooking(@User() user: UserEntity, @Body() dto: ConfirmBookingDTO) {
        return await this.userBookingService.confirmBooking(dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/cancel')
    @ApiResponse({ status: 200, description: 'Cancel current pending booking and release hold' })
    async cancelCurrentBooking(@User() user: UserEntity) {
        return await this.userBookingService.cancelCurrentBooking(user.uuid);
    }
}

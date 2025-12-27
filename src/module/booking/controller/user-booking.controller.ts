import {
    Body,
    Controller,
    Param,
    Post,
    Get,
    UseFilters,
    UseGuards,
    Res,
    Query,
} from '@nestjs/common';
import * as express from 'express';
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
import { BookingEntity } from '../entity/booking.entity';

@ApiTags('User Booking')
@Controller('user/booking')
export class UserBookingController {
    constructor(private readonly userBookingService: UserBookingService) { }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    async createBooking(
        @User() user: UserEntity,
        @Body() dto: CreateBookingDto,
    ): Promise<BookingEntity> {
        return await this.userBookingService.createBooking(user.uuid, dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('current')
    @ApiResponse({
        status: 200,
        description: 'Get current active booking from session',
    })
    async getCurrentBooking(@User() user: UserEntity): Promise<any> {
        return await this.userBookingService.getCurrentBooking(user.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/contact-info')
    @ApiResponse({
        status: 200,
        description: 'Update contact information for current booking',
    })
    async updateContactInfo(
        @User() user: UserEntity,
        @Body() dto: UpdateBookingContactDto,
    ): Promise<{ success: boolean; bookingId: number }> {
        return await this.userBookingService.updateBookingContact(
            user.uuid,
            dto,
        );
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/payment-method')
    @ApiResponse({
        status: 200,
        description: 'Update payment method for current booking',
    })
    async updatePaymentMethod(
        @User() user: UserEntity,
        @Body() dto: UpdateBookingPaymentDto,
    ): Promise<{ success: boolean; bookingId: number }> {
        return await this.userBookingService.updateBookingPayment(
            user.uuid,
            dto,
        );
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/confirm')
    @ApiResponse({ status: 200, description: 'Confirm current booking' })
    async confirmCurrentBooking(
        @User() user: UserEntity,
    ): Promise<{ success: boolean; bookingId: number }> {
        return await this.userBookingService.confirmCurrentBooking(user.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('payment-methods')
    @ApiResponse({ status: 200, description: 'Get all active payment methods' })
    async getPaymentMethods(@User() user: UserEntity): Promise<any[]> {
        return await this.userBookingService.getPaymentMethods(user?.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    @ApiResponse({ status: 200, description: 'Get user booking history' })
    async getBookingHistory(
        @User() user: UserEntity,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ): Promise<any> {
        return await this.userBookingService.getAllBookingsByUser(
            user.uuid,
            parseInt(page),
            parseInt(limit),
        );
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    @ApiResponse({ status: 200, description: 'Get booking detail' })
    async getBookingDetail(
        @User() user: UserEntity,
        @Param('id') id: number,
    ): Promise<any> {
        return await this.userBookingService.getBookingDetail(id, user);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('confirm')
    @ApiResponse({ status: 200, description: 'Confirm booking (legacy)' })
    async confirmBooking(
        @User() user: UserEntity,
        @Body() dto: ConfirmBookingDTO,
    ): Promise<any> {
        return await this.userBookingService.confirmBooking(dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('current/cancel')
    @ApiResponse({
        status: 200,
        description: 'Cancel current pending booking and release hold',
    })
    async cancelCurrentBooking(
        @User() user: UserEntity,
    ): Promise<{ success: boolean; message: string }> {
        return await this.userBookingService.cancelCurrentBooking(user.uuid);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/receipt')
    @ApiResponse({ status: 200, description: 'Download booking receipt PDF' })
    async downloadReceipt(
        @User() user: UserEntity,
        @Param('id') id: number,
        @Res() res: express.Response,
    ) {
        return await this.userBookingService.downloadReceipt(id, user, res);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/invoice')
    @ApiResponse({ status: 200, description: 'Download booking invoice PDF' })
    async downloadInvoice(
        @User() user: UserEntity,
        @Param('id') id: number,
        @Res() res: express.Response,
    ) {
        return await this.userBookingService.downloadInvoice(id, user, res);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/cancel-confirmed')
    @ApiResponse({
        status: 200,
        description: 'Cancel a confirmed booking and process refund',
    })
    async cancelConfirmedBooking(
        @User() user: UserEntity,
        @Param('id') id: number,
    ): Promise<{ success: boolean; message: string; refundAmount: number }> {
        return await this.userBookingService.cancelConfirmedBooking(id, user);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/calculate-refund')
    @ApiResponse({
        status: 200,
        description: 'Calculate potential refund amount',
    })
    async calculateRefund(@Param('id') id: number): Promise<any> {
        return await this.userBookingService.calculateRefund(id);
    }
}

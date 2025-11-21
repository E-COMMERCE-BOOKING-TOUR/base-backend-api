import { Body, Controller, Param, Post, Get, UseFilters, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ConfirmBookingDTO } from '../dto/booking.dto';
import { UserBookingService } from '../service/userBooking.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtExceptionFilter } from '@/common/exceptions/jwt.exception';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserEntity } from '@/module/user/entity/user.entity';
import { User } from '@/module/user/decorator/user.decorator';

@ApiTags('User Booking')
@Controller('user/booking')
export class UserBookingController {
    constructor(private readonly userBookingService: UserBookingService) { }

    @Post('create')
    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    async createBooking(@User() user: UserEntity, @Body() dto: CreateBookingDto) {
        return await this.userBookingService.createBooking(user.id, dto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({ status: 200, description: 'Get booking detail' })
    async getBookingDetail(@User() user: UserEntity, @Param('id') id: number) {
        return await this.userBookingService.getBookingDetail(id);
    }

    @Post('confirm')
    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({ status: 200, description: 'Confirm booking' })
    async confirmBooking(@User() user: UserEntity, @Body() dto: ConfirmBookingDTO) {
        return await this.userBookingService.confirmBooking(dto);
    }
}

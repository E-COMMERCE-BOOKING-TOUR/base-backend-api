import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';
import { SupplierBookingService } from '../service/supplier-booking.service';
import { BookingSummaryDTO } from '../dto/booking.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Supplier Booking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('provider', 'admin') // Allow admin to act as provider too, or strict 'provider'
@Controller('supplier/booking')
export class SupplierBookingController {
    constructor(
        private readonly supplierBookingService: SupplierBookingService,
    ) {}

    @Get('getAll')
    @ApiResponse({ status: 200, type: [BookingSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getMyBookings(@User() user: UserEntity) {
        return await this.supplierBookingService.getSupplierBookings(user);
    }

    @Post('confirm/:id')
    @ApiResponse({ status: 200, type: BookingSummaryDTO })
    @ApiParam({ name: 'id', type: Number })
    async confirmBooking(@User() user: UserEntity, @Param('id') id: number) {
        return await this.supplierBookingService.confirmBooking(id, user);
    }

    @Post('reject/:id')
    @ApiResponse({ status: 200, type: BookingSummaryDTO })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: { type: 'object', properties: { reason: { type: 'string' } } },
    })
    async rejectBooking(
        @User() user: UserEntity,
        @Param('id') id: number,
        @Body() payload: { reason: string },
    ) {
        return await this.supplierBookingService.rejectBooking(
            id,
            user,
            payload.reason,
        );
    }
}

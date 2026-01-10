import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { PermissionsGuard } from '@/module/user/guard/permissions.guard';
import { DashboardService } from '../service/dashboard.service';
import { UnauthorizedResponseDto } from '@/module/user/dtos';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiResponse({
        status: 200,
        description: 'Return aggregated dashboard statistics',
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getStats(@User() user: UserEntity) {
        return await this.dashboardService.getStats(user);
    }

    @Get('export/bookings')
    @ApiResponse({
        status: 200,
        description: 'Return all bookings for export',
    })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'status', required: false, description: 'Booking status filter' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async exportBookings(
        @User() user: UserEntity,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: string,
    ) {
        return await this.dashboardService.getBookingsForExport(user, startDate, endDate, status);
    }

    @Get('export/tours')
    @ApiResponse({
        status: 200,
        description: 'Return all tours for export',
    })
    @ApiQuery({ name: 'status', required: false, description: 'Tour status filter' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async exportTours(
        @User() user: UserEntity,
        @Query('status') status?: string,
    ) {
        return await this.dashboardService.getToursForExport(user, status);
    }

    @Get('export/revenue')
    @ApiResponse({
        status: 200,
        description: 'Return revenue data for export',
    })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async exportRevenue(
        @User() user: UserEntity,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.dashboardService.getRevenueForExport(user, startDate, endDate);
    }
}

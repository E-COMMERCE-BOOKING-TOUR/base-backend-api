import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';
import { DashboardService } from '../service/dashboard.service';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    @ApiResponse({
        status: 200,
        description: 'Return aggregated dashboard statistics',
    })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getStats() {
        return await this.dashboardService.getStats();
    }
}

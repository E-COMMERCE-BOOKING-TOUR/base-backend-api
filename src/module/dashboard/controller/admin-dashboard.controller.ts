import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
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
}

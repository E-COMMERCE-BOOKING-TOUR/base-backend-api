import {
    Controller,
    UseGuards,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { NotificationDTO } from '../dtos/notification.dto';

@ApiTags('Admin Notification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/notification')
export class AdminNotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách thông báo (Admin)',
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('targetGroup') targetGroup?: string,
    ) {
        return await this.notificationService.findAll(
            +page,
            +limit,
            search,
            type,
            targetGroup,
        );
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Lấy chi tiết thông báo' })
    async findOne(@Param('id') id: string) {
        return await this.notificationService.findOne(+id);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'Tạo thông báo mới' })
    async create(@Body() dto: NotificationDTO) {
        return await this.notificationService.create(dto);
    }

    @Put(':id')
    @ApiResponse({ status: 200, description: 'Cập nhật thông báo' })
    async update(@Param('id') id: string, @Body() dto: NotificationDTO) {
        return await this.notificationService.update(+id, dto);
    }

    @Delete(':id')
    @ApiResponse({ status: 200, description: 'Xóa thông báo' })
    async remove(@Param('id') id: string) {
        return await this.notificationService.remove(+id);
    }
}

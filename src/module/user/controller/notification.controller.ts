import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import {
    NotificationDTO,
    NotificationSummaryDTO,
    NotificationDetailDTO,
} from '../dtos/notification.dto';
import { UnauthorizedResponseDto } from '../dtos';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [NotificationSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAll() {
        return await this.notificationService.getAllNotifications();
    }

    @Post('getAllByUser/:userId')
    @ApiResponse({ status: 201, type: [NotificationSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getByUser(@Param('userId') userId: number) {
        return await this.notificationService.getNotificationsByUser(userId);
    }

    @Post('getById/:id')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getById(@Param('id') id: number) {
        return await this.notificationService.getById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: NotificationDTO })
    async create(@Body() dto: NotificationDTO) {
        return await this.notificationService.create(dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: NotificationDTO })
    async update(
        @Param('id') id: number,
        @Body() data: Partial<NotificationDTO>,
    ) {
        return await this.notificationService.update(id, data);
    }

    @Delete('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 5 })
    async remove(@Param('id') id: number) {
        return await this.notificationService.remove(id);
    }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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

    @Post('getAllByUser')
    @ApiResponse({ status: 201, type: [NotificationSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getByUser(@Body() userId: number) {
        return await this.notificationService.getNotificationsByUser(userId);
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getById(@Body() id: number) {
        return await this.notificationService.getById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(@Body() dto: NotificationDTO) {
        return await this.notificationService.create(dto);
    }

    @Post('update')
    @ApiResponse({ status: 201, type: NotificationDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async update(
        @Body() payload: { id: number; data: Partial<NotificationDTO> },
    ) {
        return await this.notificationService.update(payload.id, payload.data);
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Body() id: number) {
        return await this.notificationService.remove(id);
    }
}

import { Controller, Get, UseGuards, UseFilters, Query } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import { NotificationSummaryDTO } from '../dtos/notification.dto';
import { AuthGuard } from "@nestjs/passport";
import { JwtExceptionFilter } from "@/common/exceptions/jwt.exception";
import { UserEntity } from "../entity/user.entity";
import { User } from "../decorator/user.decorator";

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }
    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    @ApiResponse({ status: 200, schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/NotificationSummaryDTO' } }, total: { type: 'number' }, page: { type: 'number' }, limit: { type: 'number' }, totalPages: { type: 'number' } } } })
    async getMe(
        @User() user: UserEntity,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.notificationService.getNotificationsByUser(user.id, +page, +limit);
    }
}

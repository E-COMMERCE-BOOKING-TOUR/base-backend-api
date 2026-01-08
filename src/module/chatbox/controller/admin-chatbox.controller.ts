import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    Request,
    Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminChatboxService } from '../service/admin-chatbox.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/module/user/decorator/roles.decorator';
import { RolesGuard } from '@/module/user/guard/roles.guard';

@ApiTags('Admin Chatbox')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/chatbox')
export class AdminChatboxController {
    constructor(private readonly adminChatboxService: AdminChatboxService) { }

    @Get('conversations')
    getAllConversations(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.adminChatboxService.getAllConversations(page, limit);
    }

    @Get('conversation/:id')
    getConversationDetails(@Param('id') id: string) {
        return this.adminChatboxService.getConversationDetails(id);
    }

    @Post('reply')
    reply(@Body() body: { conversationId: string; content: string }) {
        return this.adminChatboxService.reply(
            body.conversationId,
            body.content,
        );
    }

    @Post('conversation/:id/read')
    markAsRead(@Param('id') id: string) {
        return this.adminChatboxService.markAsRead(id);
    }

    @Post('conversation/:id/category')
    updateCategory(
        @Param('id') id: string,
        @Body() body: { category: string },
    ) {
        return this.adminChatboxService.updateCategory(id, body.category);
    }

    @Patch('conversation/:id/hide')
    updateHideStatus(
        @Param('id') id: string,
        @Body() body: { isHidden: boolean },
    ) {
        return this.adminChatboxService.toggleHide(id, body.isHidden);
    }

    @Patch('conversation/:id/ai')
    toggleAi(@Param('id') id: string, @Body() body: { isAiEnabled: boolean }) {
        return this.adminChatboxService.toggleAi(id, body.isAiEnabled);
    }

    @Patch('conversation/:id/human')
    toggleHumanTakeover(
        @Param('id') id: string,
        @Body() body: { isHumanTakeover: boolean },
    ) {
        return this.adminChatboxService.toggleHumanTakeover(
            id,
            body.isHumanTakeover,
        );
    }

    @Post('sync-user-names')
    syncUserNames(@Body() body: { users: { userId: string; name: string }[] }) {
        return this.adminChatboxService.syncUserNames(body.users);
    }
}

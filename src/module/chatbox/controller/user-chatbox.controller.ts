import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserChatboxService } from '../service/user-chatbox.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../user/guard/roles.guard';

@ApiTags('Chatbox')
@Controller('chatbox')
//@UseGuards(JwtAuthGuard) // Enable real auth
//@ApiBearerAuth()
export class UserChatboxController {
    constructor(private readonly userChatboxService: UserChatboxService) { }

    // 1. User/Supplier starts chat with Admin
    @Post('start/admin')
    @UseGuards(AuthGuard('jwt')) // Requires user to be logged in
    @ApiBearerAuth()
    async startChatWithAdmin(@Request() req) {
        const currentUser = req.user; // Retrieved from JWT
        const participants = [
            { userId: currentUser.id.toString(), role: currentUser.role.name.toUpperCase(), name: currentUser.full_name },
            { userId: 'ADMIN_SYSTEM', role: 'ADMIN', name: 'System Admin' }
        ];
        return this.userChatboxService.createConversation(participants);
    }

    // 2. User starts chat with Supplier (Need Supplier ID)
    @Post('start/supplier/:supplierId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async startChatWithSupplier(@Request() req, @Param('supplierId') supplierId: string) {
        const currentUser = req.user;
        const participants = [
            { userId: currentUser.id.toString(), role: currentUser.role.name.toUpperCase(), name: currentUser.full_name },
            { userId: supplierId, role: 'SUPPLIER' }
        ];
        return this.userChatboxService.createConversation(participants);
    }

    // 3. Get my conversations
    @Get('conversations')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async getMyConversations(@Request() req) {
        return this.userChatboxService.getUserConversations(req.user.id.toString());
    }

    @Get('messages/:conversationId')
    getMessages(@Param('conversationId') conversationId: string) {
        return this.userChatboxService.getMessages(conversationId);
    }
}

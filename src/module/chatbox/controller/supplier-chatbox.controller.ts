import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupplierChatboxService } from '../service/supplier-chatbox.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/module/user/decorator/roles.decorator';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';

interface AuthenticatedRequest {
    user: {
        id?: number;
        uuid: string;
        role: { name: string };
        full_name: string;
    };
}

@ApiTags('Supplier Chatbox')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('supplier')
@Controller('supplier/chatbox')
export class SupplierChatboxController {
    constructor(
        private readonly supplierChatboxService: SupplierChatboxService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    /**
     * Get the supplier entity ID for the current user
     * Conversations store supplier entity ID as participant userId
     */
    private async getSupplierEntityId(userUuid: string): Promise<string | null> {
        const user = await this.userRepository.findOne({
            where: { uuid: userUuid },
            relations: ['supplier'],
        });
        return user?.supplier?.id?.toString() || null;
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get conversations where supplier is a participant' })
    async getMyConversations(
        @Request() req: AuthenticatedRequest,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        // Get the supplier entity ID (not user UUID)
        const supplierId = await this.getSupplierEntityId(req.user.uuid);
        if (!supplierId) {
            // User is not associated with a supplier
            return { data: [], total: 0, page, limit, total_pages: 0 };
        }
        return this.supplierChatboxService.getSupplierConversations(supplierId, page, limit);
    }

    @Get('conversation/:id')
    @ApiOperation({ summary: 'Get conversation messages' })
    async getConversationDetails(
        @Param('id') id: string,
        @Request() req: AuthenticatedRequest,
    ) {
        const supplierId = await this.getSupplierEntityId(req.user.uuid);
        if (!supplierId) {
            throw new ForbiddenException('You are not associated with a supplier');
        }

        const conversations = await this.supplierChatboxService.getSupplierConversations(supplierId, 1, 1000);
        const isParticipant = conversations.data.some(c => c._id === id);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return this.supplierChatboxService.getConversationDetails(id);
    }

    @Post('reply')
    @ApiOperation({ summary: 'Reply to a conversation' })
    async reply(
        @Request() req: AuthenticatedRequest,
        @Body() body: { conversationId: string; content: string },
    ) {
        const supplierId = await this.getSupplierEntityId(req.user.uuid);
        if (!supplierId) {
            throw new ForbiddenException('You are not associated with a supplier');
        }

        const conversations = await this.supplierChatboxService.getSupplierConversations(supplierId, 1, 1000);
        const isParticipant = conversations.data.some(c => c._id === body.conversationId);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return firstValueFrom(this.supplierChatboxService.reply(body.conversationId, supplierId, body.content));
    }

    @Post('conversation/:id/read')
    @ApiOperation({ summary: 'Mark conversation as read' })
    async markAsRead(
        @Param('id') id: string,
        @Request() req: AuthenticatedRequest,
    ) {
        const supplierId = await this.getSupplierEntityId(req.user.uuid);
        if (!supplierId) {
            throw new ForbiddenException('You are not associated with a supplier');
        }

        const conversations = await this.supplierChatboxService.getSupplierConversations(supplierId, 1, 1000);
        const isParticipant = conversations.data.some(c => c._id === id);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return this.supplierChatboxService.markAsRead(id);
    }
}

import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserChatboxService } from '../service/user-chatbox.service';
import { ChatRoutingService, ChatContext } from '../service/chat-routing.service';
import { AuthGuard } from '@nestjs/passport';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';

interface AuthenticatedRequest {
    user: {
        id?: number;  // Optional - may not be in token
        uuid: string;
        role: { name: string };
        full_name: string;
    };
}

interface StartChatBody {
    tourId?: number;
    tourSlug?: string;
    bookingId?: number;
}

@ApiTags('Chatbox')
@Controller('chatbox')
export class UserChatboxController {
    constructor(
        private readonly userChatboxService: UserChatboxService,
        private readonly chatRoutingService: ChatRoutingService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    /**
     * Normalize role name to match chat schema: 'USER' | 'ADMIN' | 'SUPPLIER'
     * Maps customer, content_manager, moderator, etc. to 'USER'
     */
    private normalizeChatRole(roleName: string): 'USER' | 'ADMIN' | 'SUPPLIER' {
        const upperRole = roleName.toUpperCase();
        if (upperRole === 'ADMIN') return 'ADMIN';
        if (upperRole === 'SUPPLIER') return 'SUPPLIER';
        return 'USER'; // Default: customer, content_manager, moderator, etc. → USER
    }

    // 1. User/Supplier starts chat with Admin (with optional context)
    @Post('start/admin')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start chat with admin, optionally with tour/booking context' })
    @ApiBody({ schema: { properties: { tourId: { type: 'number' }, tourSlug: { type: 'string' }, bookingId: { type: 'number' } } }, required: false })
    async startChatWithAdmin(
        @Request() req: AuthenticatedRequest,
        @Body() body?: StartChatBody,
    ) {
        const currentUser = req.user;

        // Build context if provided
        let context: ChatContext | undefined;
        if (body?.tourId || body?.tourSlug || body?.bookingId) {
            context = await this.chatRoutingService.buildContext({
                tourId: body.tourId,
                tourSlug: body.tourSlug,
                bookingId: body.bookingId,
            });
        }

        // Use uuid for userId - token only contains uuid
        const userId = currentUser.uuid;

        const participants = [
            {
                userId,
                role: this.normalizeChatRole(currentUser.role.name),
                name: currentUser.full_name,
            },
            { userId: 'ADMIN_SYSTEM', role: 'ADMIN', name: 'System Admin' },
        ];

        // Sync user info to update name in all existing conversations (only if name is valid)
        if (currentUser.full_name) {
            try {
                await lastValueFrom(this.userChatboxService.syncUser({
                    userId,
                    name: currentUser.full_name,
                }));
            } catch (error) {
                console.error('Failed to sync user info:', error);
                // Continue with conversation creation even if sync fails
            }
        }

        // Pass context to conversation creation
        return this.userChatboxService.createConversation(participants, context);
    }

    // 2. User starts chat with Supplier (Need Supplier ID)
    @Post('start/supplier/:supplierId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async startChatWithSupplier(
        @Request() req: AuthenticatedRequest,
        @Param('supplierId') supplierId: string,
    ) {
        const currentUser = req.user;
        // Use uuid for userId - token only contains uuid
        const userId = currentUser.uuid;

        // The supplierId from frontend is the supplier entity ID (from suppliers table)
        // We store this directly in the conversation so supplier users can query by their supplier_id
        const supplierIdNum = parseInt(supplierId, 10);
        let supplierUserIdInConvo = supplierId; // Store supplier entity ID
        let supplierName: string | undefined;

        if (!isNaN(supplierIdNum)) {
            // Lookup supplier name from supplier entity
            const supplierUser = await this.userRepository.findOne({
                where: { supplier: { id: supplierIdNum } },
                relations: ['supplier'],
                select: ['id', 'full_name', 'supplier'],
            });
            if (supplierUser?.supplier) {
                supplierName = supplierUser.supplier.name || supplierUser.full_name;
            }
        }

        const participants = [
            {
                userId,
                role: this.normalizeChatRole(currentUser.role.name),
                name: currentUser.full_name,
            },
            // Store supplier entity ID (numeric) as string - matches what supplier users have in their token
            { userId: supplierIdNum.toString(), role: 'SUPPLIER', name: supplierName },
        ];

        // Sync user info to update name in all existing conversations (only if name is valid)
        if (currentUser.full_name) {
            try {
                await lastValueFrom(this.userChatboxService.syncUser({
                    userId,
                    name: currentUser.full_name,
                }));
            } catch (error) {
                console.error('Failed to sync user info:', error);
                // Continue with conversation creation even if sync fails
            }
        }

        // Supplier conversations don't need AI support
        return this.userChatboxService.createConversation(participants, undefined, { isAiEnabled: false });
    }

    // 3. Get my conversations
    @Get('conversations')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    getMyConversations(@Request() req: AuthenticatedRequest) {
        return this.userChatboxService.getUserConversations(req.user.uuid);
    }

    @Get('messages/:conversationId')
    getMessages(@Param('conversationId') conversationId: string) {
        return this.userChatboxService.getMessages(conversationId);
    }

    // 4. Get user's recent bookings for chat context selection
    @Get('recent-bookings')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get recent bookings for chat context selection' })
    async getRecentBookings(@Request() req: AuthenticatedRequest) {
        // Use id if available for DB queries, otherwise try uuid lookup
        return this.chatRoutingService.getUserRecentBookings(req.user.id ?? 0);
    }

    // 5. Build chat context from tour/booking info
    @Get('context')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Build chat context from tour ID, slug, or booking ID' })
    @ApiQuery({ name: 'tourId', required: false, type: Number })
    @ApiQuery({ name: 'tourSlug', required: false, type: String })
    @ApiQuery({ name: 'bookingId', required: false, type: Number })
    async getChatContext(
        @Query('tourId') tourId?: number,
        @Query('tourSlug') tourSlug?: string,
        @Query('bookingId') bookingId?: number,
    ) {
        return this.chatRoutingService.buildContext({ tourId, tourSlug, bookingId });
    }
}

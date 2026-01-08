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

interface AuthenticatedRequest {
    user: {
        id: number;
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
    ) { }

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

        const participants = [
            {
                userId: currentUser.id.toString(),
                role: currentUser.role.name.toUpperCase(),
                name: currentUser.full_name,
            },
            { userId: 'ADMIN_SYSTEM', role: 'ADMIN', name: 'System Admin' },
        ];

        // Pass context to conversation creation
        return this.userChatboxService.createConversation(participants, context);
    }

    // 2. User starts chat with Supplier (Need Supplier ID)
    @Post('start/supplier/:supplierId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    startChatWithSupplier(
        @Request() req: AuthenticatedRequest,
        @Param('supplierId') supplierId: string,
    ) {
        const currentUser = req.user;
        const participants = [
            {
                userId: currentUser.id.toString(),
                role: currentUser.role.name.toUpperCase(),
                name: currentUser.full_name,
            },
            { userId: supplierId, role: 'SUPPLIER' },
        ];
        return this.userChatboxService.createConversation(participants);
    }

    // 3. Get my conversations
    @Get('conversations')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    getMyConversations(@Request() req: AuthenticatedRequest) {
        return this.userChatboxService.getUserConversations(
            req.user.id.toString(),
        );
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
        return this.chatRoutingService.getUserRecentBookings(req.user.id);
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

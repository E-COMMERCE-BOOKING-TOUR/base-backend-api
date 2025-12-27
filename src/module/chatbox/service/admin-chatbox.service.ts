import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AdminChatboxService {
    constructor(
        @Inject('CHATBOX_SERVICE') private client: ClientProxy,
    ) { }

    getAllConversations(page: number, limit: number) {
        return this.client.send({ cmd: 'get_all_conversations' }, { page, limit });
    }

    getConversationDetails(conversationId: string) {
        // Reusing the same pattern as getting messages
        return this.client.send({ cmd: 'get_messages' }, conversationId);
    }

    reply(conversationId: string, content: string) {
        // Admin reply is just sending a message with admin role
        const payload = {
            conversationId,
            senderId: 'ADMIN_SYSTEM', // Or specific admin ID if available, using fixed generic for now
            senderRole: 'ADMIN',
            content,
        };
        return this.client.send({ cmd: 'send_message' }, payload);
    }

    updateCategory(conversationId: string, category: string) {
        return this.client.send({ cmd: 'update_category' }, { conversationId, category });
    }

    toggleHide(conversationId: string, isHidden: boolean) {
        return this.client.send({ cmd: 'toggle_hide' }, { conversationId, isHidden });
    }

    markAsRead(conversationId: string) {
        return this.client.send({ cmd: 'mark_as_read' }, conversationId);
    }
}

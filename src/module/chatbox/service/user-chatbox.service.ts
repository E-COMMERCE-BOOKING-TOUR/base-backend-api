import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChatContext } from './chat-routing.service';

@Injectable()
export class UserChatboxService {
    constructor(@Inject('CHATBOX_SERVICE') private client: ClientProxy) { }

    createConversation(
        participants: { userId: string; role: string; name?: string }[],
        context?: ChatContext,
        options?: { isAiEnabled?: boolean },
    ) {
        return this.client.send({ cmd: 'create_conversation' }, { participants, context, ...options });
    }

    getUserConversations(userId: string) {
        return this.client.send({ cmd: 'get_user_conversations' }, userId);
    }

    getMessages(conversationId: string) {
        return this.client.send({ cmd: 'get_messages' }, conversationId);
    }

    syncUser(data: { userId: string; name: string }) {
        // Use send() instead of emit() for reliability - waits for acknowledgment
        return this.client.send({ cmd: 'update_user_info' }, data);
    }

    toggleAi(conversationId: string, isAiEnabled: boolean) {
        return this.client.send(
            { cmd: 'toggle_ai' },
            { conversationId, isAiEnabled },
        );
    }

    toggleHumanTakeover(conversationId: string, isHumanTakeover: boolean) {
        return this.client.send(
            { cmd: 'toggle_human_takeover' },
            { conversationId, isHumanTakeover },
        );
    }
}

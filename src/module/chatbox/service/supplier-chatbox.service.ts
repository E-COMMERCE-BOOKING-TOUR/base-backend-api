import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';
import { firstValueFrom } from 'rxjs';

export interface Participant {
    userId: string;
    role: string;
    name?: string;
}

export interface Conversation {
    _id: string;
    participants: Participant[];
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
    category?: string;
    isHidden?: boolean;
    isAiEnabled?: boolean;
    isHumanTakeover?: boolean;
}

export interface ConversationsResponse {
    data: Conversation[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

@Injectable()
export class SupplierChatboxService {
    constructor(
        @Inject('CHATBOX_SERVICE') private client: ClientProxy,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    async getSupplierConversations(supplierUuid: string, page: number, limit: number) {
        const result = await firstValueFrom(
            this.client.send<ConversationsResponse>(
                { cmd: 'get_supplier_conversations' },
                { supplierUserId: supplierUuid, page, limit },
            ),
        );

        // Lookup user names for participants without names
        const userRoles = ['USER', 'user', 'CUSTOMER', 'customer'];
        const uuidIdsToLookup = new Set<string>();

        for (const convo of result.data) {
            for (const p of convo.participants) {
                if (userRoles.includes(p.role) && !p.name) {
                    uuidIdsToLookup.add(p.userId);
                }
            }
        }

        // Fetch user names from database
        const userMap = new Map<string, string>();

        if (uuidIdsToLookup.size > 0) {
            const users = await this.userRepo.find({
                where: { uuid: In([...uuidIdsToLookup]) },
                select: ['uuid', 'full_name'],
            });
            users.forEach((u) => userMap.set(u.uuid, u.full_name));
        }

        // Enrich conversation participants with names
        for (const convo of result.data) {
            for (const p of convo.participants) {
                if (userRoles.includes(p.role) && !p.name && userMap.has(p.userId)) {
                    p.name = userMap.get(p.userId);
                }
            }
        }

        return result;
    }

    getConversationDetails(conversationId: string) {
        return this.client.send({ cmd: 'get_messages' }, conversationId);
    }

    reply(conversationId: string, supplierUuid: string, content: string) {
        const payload = {
            conversationId,
            senderId: supplierUuid,
            senderRole: 'SUPPLIER',
            content,
        };
        return this.client.send({ cmd: 'send_message' }, payload);
    }

    markAsRead(conversationId: string) {
        return this.client.send({ cmd: 'mark_as_read' }, conversationId);
    }
}

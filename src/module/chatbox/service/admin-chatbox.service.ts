import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
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
export class AdminChatboxService {
    constructor(
        @Inject('CHATBOX_SERVICE') private client: ClientProxy,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(SupplierEntity) private supplierRepo: Repository<SupplierEntity>,
    ) { }

    async getAllConversations(page: number, limit: number) {
        const result = await firstValueFrom(
            this.client.send<ConversationsResponse>(
                { cmd: 'get_all_conversations' },
                { page, limit },
            ),
        );

        // Roles that should have their names looked up from users table
        const userRoles = ['USER', 'user', 'CUSTOMER', 'customer'];
        const supplierRoles = ['SUPPLIER', 'supplier'];

        // Collect all IDs that need name lookup
        const numericIdsToLookup = new Set<number>();
        const uuidIdsToLookup = new Set<string>();
        const supplierIdsToLookup = new Set<number>();

        for (const convo of result.data) {
            for (const p of convo.participants) {
                if (!p.name) {
                    if (supplierRoles.includes(p.role)) {
                        // Supplier participants use supplier entity ID
                        const supplierId = parseInt(p.userId, 10);
                        if (!isNaN(supplierId)) {
                            supplierIdsToLookup.add(supplierId);
                        }
                    } else if (userRoles.includes(p.role)) {
                        const numericId = parseInt(p.userId, 10);
                        if (!isNaN(numericId) && numericId.toString() === p.userId) {
                            numericIdsToLookup.add(numericId);
                        } else {
                            uuidIdsToLookup.add(p.userId);
                        }
                    }
                }
            }
        }

        // Fetch user names from database
        const userMap = new Map<string, string>();

        if (numericIdsToLookup.size > 0) {
            const users = await this.userRepo.find({
                where: { id: In([...numericIdsToLookup]) },
                select: ['id', 'full_name'],
            });
            users.forEach((u) => userMap.set(u.id.toString(), u.full_name));
        }

        if (uuidIdsToLookup.size > 0) {
            const users = await this.userRepo.find({
                where: { uuid: In([...uuidIdsToLookup]) },
                select: ['uuid', 'full_name'],
            });
            users.forEach((u) => userMap.set(u.uuid, u.full_name));
        }

        // Fetch supplier names
        const supplierMap = new Map<string, string>();
        if (supplierIdsToLookup.size > 0) {
            const suppliers = await this.supplierRepo.find({
                where: { id: In([...supplierIdsToLookup]) },
                select: ['id', 'name'],
            });
            suppliers.forEach((s) => supplierMap.set(s.id.toString(), s.name));
        }

        // Enrich conversation participants with names
        for (const convo of result.data) {
            for (const p of convo.participants) {
                if (!p.name) {
                    if (supplierRoles.includes(p.role) && supplierMap.has(p.userId)) {
                        p.name = supplierMap.get(p.userId);
                    } else if (userRoles.includes(p.role) && userMap.has(p.userId)) {
                        p.name = userMap.get(p.userId);
                    }
                }
            }
        }

        return result;
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
        return this.client.send(
            { cmd: 'update_category' },
            { conversationId, category },
        );
    }

    toggleHide(conversationId: string, isHidden: boolean) {
        return this.client.send(
            { cmd: 'toggle_hide' },
            { conversationId, isHidden },
        );
    }

    markAsRead(conversationId: string) {
        return this.client.send({ cmd: 'mark_as_read' }, conversationId);
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

    syncUserNames(users: { userId: string; name: string }[]) {
        // Emit update for each user to sync their name in all conversations
        users.forEach((user) => {
            this.client.emit({ cmd: 'update_user_info' }, user);
        });
        return { success: true, count: users.length };
    }
}

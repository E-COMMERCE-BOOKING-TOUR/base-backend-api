import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationEntity } from '../entity/notification.entity';
import { UserEntity } from '../entity/user.entity';
import {
    NotificationDTO,
    NotificationSummaryDTO,
    NotificationDetailDTO,
    NotificationType,
} from '../dtos/notification.dto';

export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    private async getUserIdsByNotificationId(id: number): Promise<number[]> {
        const ids: number[] = [];
        for (const table of ['notification_users']) {
            try {
                const rows: Array<{ user_id: number }> =
                    await this.notificationRepository.query(
                        `SELECT user_id FROM ${table} WHERE notification_id = ?`,
                        [id],
                    );
                for (const r of rows) ids.push(Number(r.user_id));
            } catch (error: any) {
                throw new Error(
                    `Error getting user ids for notification ${id}: ${error}`,
                );
            }
        }
        return Array.from(new Set(ids));
    }

    private async getNotificationIdsByUserId(
        userId: number,
    ): Promise<number[]> {
        const ids: number[] = [];
        for (const table of ['notification_users']) {
            try {
                const rows: Array<{ notification_id: number }> =
                    await this.notificationRepository.query(
                        `SELECT notification_id FROM ${table} WHERE user_id = ?`,
                        [userId],
                    );
                for (const r of rows) ids.push(Number(r.notification_id));
            } catch (error: any) {
                throw new Error(
                    `Error getting notification ids for user ${userId}: ${error}`,
                );
            }
        }
        return Array.from(new Set(ids));
    }

    async getAllNotifications(): Promise<NotificationSummaryDTO[]> {
        const list = await this.notificationRepository.find({
            relations: ['users'],
            order: { created_at: 'DESC' },
        });
        const mapped = list.map(
            (n) =>
                new NotificationSummaryDTO({
                    id: n.id,
                    title: n.title,
                    type: n.type as NotificationType,
                    is_error: !!n.is_error,
                    is_user: !!n.is_user,
                    users: n.users ?? [],
                    created_at: n.created_at,
                    updated_at: n.updated_at,
                    deleted_at: n.deleted_at ?? undefined,
                } as Partial<NotificationSummaryDTO>),
        );
        return mapped;
    }

    async getNotificationsByUser(
        userId: number,
    ): Promise<NotificationSummaryDTO[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) return [];
        const notifIds = await this.getNotificationIdsByUserId(userId);
        if (!notifIds.length) return [];
        const list = await this.notificationRepository.find({
            where: { id: In(notifIds) },
            relations: ['users'],
            order: { created_at: 'DESC' },
        });
        const mapped = list.map(
            (n) =>
                new NotificationSummaryDTO({
                    id: n.id,
                    title: n.title,
                    type: n.type as NotificationType,
                    is_error: !!n.is_error,
                    is_user: !!n.is_user,
                    users: n.users ?? [],
                    created_at: n.created_at,
                    updated_at: n.updated_at,
                    deleted_at: n.deleted_at ?? undefined,
                } as Partial<NotificationSummaryDTO>),
        );
        return mapped;
    }

    async getById(id: number): Promise<NotificationDetailDTO | null> {
        const n = await this.notificationRepository.findOne({
            where: { id },
            relations: ['users'],
        });
        if (!n) return null;
        return new NotificationDetailDTO({
            id: n.id,
            title: n.title,
            type: n.type as NotificationType,
            is_error: !!n.is_error,
            is_user: !!n.is_user,
            description: n.description,
            users: n.users ?? [],
            created_at: n.created_at,
            updated_at: n.updated_at,
            deleted_at: n.deleted_at ?? undefined,
        } as Partial<NotificationDetailDTO>);
    }

    async create(dto: NotificationDTO): Promise<NotificationDetailDTO> {
        const users = dto.user_ids?.length
            ? await this.userRepository.find({
                  where: { id: In(dto.user_ids) },
              })
            : [];
        const entity = this.notificationRepository.create({
            title: dto.title,
            description: dto.description,
            type: dto.type,
            is_error: dto.is_error ?? false,
            is_user: dto.is_user ?? false,
            users,
        });
        const saved = await this.notificationRepository.save(entity);
        return (await this.getById(saved.id)) as NotificationDetailDTO;
    }

    async update(
        id: number,
        dto: Partial<NotificationDTO>,
    ): Promise<NotificationDetailDTO | null> {
        const n = await this.notificationRepository.findOne({
            where: { id },
            relations: ['users'],
        });
        if (!n) return null;
        n.title = dto.title ?? n.title;
        n.description = dto.description ?? n.description;
        n.type = dto.type ?? n.type;
        n.is_error = dto.is_error ?? n.is_error;
        n.is_user = dto.is_user ?? n.is_user;
        if (dto.user_ids) {
            const users = await this.userRepository.find({
                where: { id: In(dto.user_ids) },
            });
            n.users = users;
        }
        await this.notificationRepository.save(n);
        return this.getById(id);
    }

    async remove(id: number): Promise<boolean> {
        const res = await this.notificationRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }
}

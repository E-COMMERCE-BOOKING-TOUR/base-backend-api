import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entity/notification.entity';
import {
    NotificationSummaryDTO,
    NotificationType,
} from '../dtos/notification.dto';

export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
    ) { }

    async getNotificationsByUser(
        userId: number,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: NotificationSummaryDTO[], total: number, page: number, limit: number, totalPages: number }> {
        const skip = (page - 1) * limit;

        const [list, total] = await this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.users', 'user')
            .where('notification.is_user = :is_user_false', { is_user_false: false })
            .orWhere(
                '(notification.is_user = :is_user_true AND user.id = :userId)',
                {
                    is_user_true: true,
                    userId,
                },
            )
            .orderBy('notification.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const data = list.map(
            (n) =>
                new NotificationSummaryDTO({
                    id: n.id,
                    title: n.title,
                    description: n.description,
                    type: n.type as NotificationType,
                    is_error: !!n.is_error,
                    is_user: !!n.is_user,
                    user_ids: n.users?.map((u) => u.id) ?? [],
                    created_at: n.created_at,
                    updated_at: n.updated_at,
                    deleted_at: n.deleted_at ?? undefined,
                }),
        );

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}

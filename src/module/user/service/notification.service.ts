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

    async getAllNotifications(): Promise<NotificationSummaryDTO[]> {
        const list = await this.notificationRepository.find({
            order: { created_at: 'DESC' },
        });
        return list.map(
            (n) =>
                new NotificationSummaryDTO({
                    id: n.id,
                    title: n.title,
                    type: n.type as NotificationType,
                    is_error: !!n.is_error,
                    is_user: !!n.is_user,
                }),
        );
    }

    async getNotificationsByUser(
        userId: number,
    ): Promise<NotificationSummaryDTO[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['tours_favorites'],
        });
        if (!user) return [];
        const list = await this.notificationRepository
            .createQueryBuilder('n')
            .leftJoin('n.users', 'u')
            .where('u.id = :userId', { userId })
            .orderBy('n.created_at', 'DESC')
            .getMany();
        return list.map(
            (n) =>
                new NotificationSummaryDTO({
                    id: n.id,
                    title: n.title,
                    type: n.type as NotificationType,
                    is_error: !!n.is_error,
                    is_user: !!n.is_user,
                }),
        );
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
            user_ids: (n.users ?? []).map((u) => u.id),
        });
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

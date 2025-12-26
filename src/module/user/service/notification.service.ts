import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotificationEntity } from '../entity/notification.entity';
import {
    NotificationDTO,
    NotificationSummaryDTO,
    NotificationType,
    TargetGroup,
} from '../dtos/notification.dto';
import { UserEntity } from '../entity/user.entity';
import { NotFoundException } from '@nestjs/common';

export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getNotificationsByUser(
        user: UserEntity,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: NotificationSummaryDTO[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const roleName = user.role?.name;

        const query = this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.users', 'user')
            .where('notification.target_group = :all', {
                all: TargetGroup.all,
            });

        if (roleName === 'admin') {
            query.orWhere('notification.target_group = :admin', {
                admin: TargetGroup.admin,
            });
        } else if (roleName === 'supplier') {
            query.orWhere('notification.target_group = :supplier', {
                supplier: TargetGroup.supplier,
            });
        }

        query.orWhere(
            '(notification.target_group = :specific AND user.id = :userId)',
            {
                specific: TargetGroup.specific,
                userId: user.id,
            },
        );

        const [list, total] = await query
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
                    target_group: n.target_group as TargetGroup,
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

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        type?: string,
        targetGroup?: string,
    ) {
        const skip = (page - 1) * limit;

        const query = this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.users', 'users')
            .orderBy('notification.created_at', 'DESC');

        if (search) {
            query.andWhere(
                '(notification.title ILIKE :search OR notification.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (type) {
            query.andWhere('notification.type = :type', { type });
        }

        if (targetGroup) {
            query.andWhere('notification.target_group = :targetGroup', {
                targetGroup,
            });
        }

        const [list, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data: list.map(
                (n) =>
                    new NotificationSummaryDTO({
                        id: n.id,
                        title: n.title,
                        description: n.description,
                        type: n.type as NotificationType,
                        is_error: !!n.is_error,
                        is_user: !!n.is_user,
                        target_group: n.target_group as TargetGroup,
                        user_ids: n.users?.map((u) => u.id) ?? [],
                        created_at: n.created_at,
                        updated_at: n.updated_at,
                        deleted_at: n.deleted_at ?? undefined,
                    }),
            ),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return new NotificationSummaryDTO({
            id: notification.id,
            title: notification.title,
            description: notification.description,
            type: notification.type as NotificationType,
            is_error: !!notification.is_error,
            is_user: !!notification.is_user,
            target_group: notification.target_group as TargetGroup,
            user_ids: notification.users?.map((u) => u.id) ?? [],
            created_at: notification.created_at,
            updated_at: notification.updated_at,
            deleted_at: notification.deleted_at ?? undefined,
        });
    }

    async create(dto: NotificationDTO) {
        const notification = this.notificationRepository.create({
            title: dto.title,
            description: dto.description,
            type: dto.type,
            is_error: dto.is_error ?? false,
            is_user: dto.is_user ?? false,
            target_group: dto.target_group ?? TargetGroup.all,
        });

        if (dto.user_ids && dto.user_ids.length > 0) {
            notification.users = await this.userRepository.findBy({
                id: In(dto.user_ids),
            });
        }

        const saved = await this.notificationRepository.save(notification);
        return this.findOne(saved.id);
    }

    async update(id: number, dto: NotificationDTO) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        notification.title = dto.title ?? notification.title;
        notification.description = dto.description ?? notification.description;
        notification.type = dto.type ?? notification.type;
        notification.is_error = dto.is_error ?? notification.is_error;
        notification.is_user = dto.is_user ?? notification.is_user;
        notification.target_group =
            dto.target_group ?? notification.target_group;

        if (dto.user_ids) {
            if (dto.user_ids.length > 0) {
                notification.users = await this.userRepository.findBy({
                    id: In(dto.user_ids),
                });
            } else {
                notification.users = [];
            }
        }

        const saved = await this.notificationRepository.save(notification);
        return this.findOne(saved.id);
    }

    async remove(id: number) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });
        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }
        await this.notificationRepository.softRemove(notification);
        return { success: true };
    }
}

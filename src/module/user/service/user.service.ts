import { UserEntity } from '../entity/user.entity';
import { ArticleServiceProxy } from '../../article/service/article.service-proxy';
import { randomUUID } from 'crypto';
import { hashPassword } from '@/utils/bcrypt.util';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Like, Repository, In } from 'typeorm';
import {
    UserDTO,
    UpdateUserDTO,
    UserSummaryDTO,
    UserDetailDTO,
    UserStatus,
    LoginType,
    UpdateProfileDTO,
    ChangePasswordDTO,
} from '../dtos/user.dto';
import { CountryEntity } from '@/common/entity/country.entity';
import { SupplierEntity } from '../entity/supplier.entity';
import { RoleEntity } from '../entity/role.entity';
import { comparePassword } from '@/utils/bcrypt.util';
import {
    BadRequestException,
    Injectable,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationService } from './notification.service';
import { NotificationType } from '../dtos/notification.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(forwardRef(() => ArticleServiceProxy))
        private readonly articleServiceProxy: ArticleServiceProxy,
        @InjectQueue('user-sync') private bgQueue: Queue,
        private readonly notificationService: NotificationService,
    ) { }

    async getAllUsers(
        page: number = 1,
        limit: number = 10,
        search?: string,
        role_id?: number,
        supplier_id?: number,
        status?: number,
    ): Promise<{
        data: UserSummaryDTO[];
        total_items: number;
        total_pages: number;
        current_page: number;
    }> {
        const skip = (page - 1) * limit;
        const where: Record<string, any> = {};

        if (search) {
            where.full_name = Like(`%${search}%`);
            // You might want to search other fields too, but TypeORM simple find options don't support OR across fields easily without QueryBuilder.
            // For now, let's search full_name or switch to QueryBuilder if needed.
            // Using QueryBuilder is better for multiple fields OR search.
        }

        // Actually, complex OR search is better with QueryBuilder. Let's rewrite to use QueryBuilder.
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.country', 'country')
            .leftJoinAndSelect('user.supplier', 'supplier')
            .leftJoinAndSelect('user.role', 'role')
            .orderBy('user.created_at', 'DESC')
            .take(limit)
            .skip(skip);

        if (search) {
            query.andWhere(
                '(LOWER(user.full_name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.username) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        if (role_id) {
            query.andWhere('user.role_id = :role_id', { role_id });
        }

        if (supplier_id) {
            query.andWhere('user.supplier_id = :supplier_id', { supplier_id });
        }

        if (status !== undefined) {
            query.andWhere('user.status = :status', { status });
        }

        const [users, total] = await query.getManyAndCount();

        const dtos = users.map(
            (u) =>
                new UserSummaryDTO({
                    id: u.id,
                    uuid: u.uuid,
                    username: u.username,
                    full_name: u.full_name,
                    email: u.email ?? undefined,
                    phone: u.phone ?? undefined,
                    status: u.status as UserStatus,
                    login_type: u.login_type as LoginType,
                    country: u.country ?? undefined,
                    supplier: u.supplier ?? null,
                    role: u.role ?? undefined,
                    avatar_url: u.avatar_url ?? undefined,
                    created_at: u.created_at,
                    updated_at: u.updated_at,
                    deleted_at: u.deleted_at ?? undefined,
                } as Partial<UserSummaryDTO>),
        );

        return {
            data: dtos,
            total_items: total,
            total_pages: Math.ceil(total / limit),
            current_page: page,
        };
    }

    async getUserById(id: number): Promise<UserDetailDTO | null> {
        const u = await this.userRepository.findOne({
            where: { id },
            relations: ['country', 'supplier', 'role'],
        });
        if (!u) return null;
        return new UserDetailDTO({
            id: u.id,
            uuid: u.uuid,
            username: u.username,
            full_name: u.full_name,
            email: u.email ?? undefined,
            phone: u.phone ?? undefined,
            status: u.status as UserStatus,
            login_type: u.login_type as LoginType,
            country: u.country ?? undefined,
            supplier: u.supplier ?? null,
            role: u.role ?? undefined,
            avatar_url: u.avatar_url ?? undefined,
            tours_favorites: [],
            articles_like: [],
            created_at: u.created_at,
            updated_at: u.updated_at,
            deleted_at: u.deleted_at ?? undefined,
        } as Partial<UserDetailDTO>);
    }

    async getUserByUuid(uuid: string): Promise<UserDetailDTO | null> {
        const u = await this.userRepository.findOne({
            where: { uuid },
            relations: ['country', 'supplier', 'role'],
        });
        if (!u) return null;
        return new UserDetailDTO({
            id: u.id,
            uuid: u.uuid,
            username: u.username,
            full_name: u.full_name,
            email: u.email ?? undefined,
            phone: u.phone ?? undefined,
            status: u.status as UserStatus,
            login_type: u.login_type as LoginType,
            country: u.country ?? undefined,
            supplier: u.supplier ?? null,
            role: u.role ?? undefined,
            avatar_url: u.avatar_url ?? undefined,
            tours_favorites: [],
            articles_like: [],
            created_at: u.created_at,
            updated_at: u.updated_at,
            deleted_at: u.deleted_at ?? undefined,
        } as Partial<UserDetailDTO>);
    }

    async createUser(dto: UserDTO): Promise<UserDetailDTO> {
        const user = await this.userRepository.save(
            this.userRepository.create({
                uuid: randomUUID(),
                username: dto.username,
                password: dto.password,
                full_name: dto.full_name,
                email: dto.email ?? null,
                phone: dto.phone ?? null,
                status: dto.status ?? UserStatus.active,
                login_type: dto.login_type ?? LoginType.account,
                country: dto.country_id
                    ? ({ id: dto.country_id } as CountryEntity)
                    : undefined,
                supplier: dto.supplier_id
                    ? ({ id: dto.supplier_id } as SupplierEntity)
                    : undefined,
                role: dto.role_id
                    ? ({ id: dto.role_id } as RoleEntity)
                    : undefined,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
                deleted_at: dto.deleted_at ?? undefined,
            } as DeepPartial<UserEntity>),
        );
        return (await this.getUserById(user.id)) as UserDetailDTO;
    }

    async updateUser(
        id: number,
        dto: UpdateUserDTO,
    ): Promise<UserDetailDTO | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) return null;
        user.password = dto.password ?? user.password;
        user.full_name = dto.full_name ?? user.full_name;
        user.email = dto.email ?? user.email;
        user.phone = dto.phone ?? user.phone;
        user.status = dto.status ?? user.status;
        user.login_type = dto.login_type ?? (user.login_type as LoginType);
        if (dto.country_id)
            user.country = { id: dto.country_id } as CountryEntity;
        if (dto.supplier_id !== undefined)
            user.supplier = dto.supplier_id
                ? ({ id: dto.supplier_id } as SupplierEntity)
                : null;
        if (dto.role_id) user.role = { id: dto.role_id } as RoleEntity;
        if (dto.role_id) user.role = { id: dto.role_id } as RoleEntity;
        user.avatar_url = dto.avatar_url ?? user.avatar_url;
        user.updated_at = dto.updated_at ?? new Date();
        await this.userRepository.save(user);

        if (dto.full_name || dto.avatar_url) {
            void this.bgQueue.add('update-info', {
                userId: user.id.toString(),
                name: user.full_name,
                avatar: user.avatar_url,
            });
        }

        return this.getUserById(id);
    }

    async removeUser(id: number): Promise<boolean> {
        const res = await this.userRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async updateProfile(
        id: number,
        dto: UpdateProfileDTO,
    ): Promise<UserDetailDTO | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) return null;

        // Verify old password if full_name or phone or password-related fields are changed?
        // For simplicity and matching requirements, if avatar_url is being updated, we might not need oldPassword.
        // But the DTO says oldPassword is required. Let's make it optional in DTO first.
        if (dto.oldPassword) {
            const isValid = await comparePassword(dto.oldPassword, user.password);
            if (!isValid) {
                throw new BadRequestException('Mật khẩu cũ không chính xác!');
            }
        } else if (!dto.avatar_url) {
            // If no old password and not an avatar update, we might still want to require it for name/phone changes.
            // But let's allow avatar update without password.
            throw new BadRequestException('Vui lòng nhập mật khẩu cũ để thay đổi thông tin!');
        }

        // Only allow updating specific fields
        user.full_name = dto.full_name ?? user.full_name;
        user.phone = dto.phone ?? user.phone;
        user.avatar_url = dto.avatar_url ?? user.avatar_url;

        user.updated_at = new Date();
        await this.userRepository.save(user);

        // Sync to chatbox if name or avatar changed
        if (dto.full_name || dto.avatar_url) {
            void this.bgQueue.add('update-info', {
                userId: user.id.toString(), // Assuming userId in chatbox is string(id)
                name: user.full_name,
                avatar: user.avatar_url,
            });
        }

        return this.getUserById(id);
    }

    async changePassword(
        id: number,
        dto: ChangePasswordDTO,
    ): Promise<{ success: boolean }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) return { success: false };

        // Verify old password
        const isValid = await comparePassword(dto.oldPassword, user.password);
        if (!isValid) {
            throw new BadRequestException('Mật khẩu cũ không chính xác!');
        }

        // Hash and save new password
        user.password = await hashPassword(dto.newPassword);
        user.updated_at = new Date();
        await this.userRepository.save(user);

        return { success: true };
    }

    private async resolveNumericId(idOrUuid: number | string): Promise<number> {
        if (typeof idOrUuid === 'number') return idOrUuid;
        const num = Number(idOrUuid);
        if (!isNaN(num)) return num;

        const user = await this.userRepository.findOne({ where: { uuid: idOrUuid as string } });
        if (!user) throw new BadRequestException('User not found');
        return user.id;
    }

    async follow(followerId: number, followingId: number | string) {
        const numericFollowingId = await this.resolveNumericId(followingId);

        if (followerId === numericFollowingId)
            throw new BadRequestException('Cannot follow yourself');
        const savedFollow = (await this.articleServiceProxy.follow(
            followerId,
            numericFollowingId,
        )) as unknown;

        if (savedFollow) {
            try {
                const follower = await this.userRepository.findOne({
                    where: { id: followerId },
                });
                await this.notificationService.create({
                    title: follower?.full_name || 'Someone',
                    description: `started following you`,
                    type: NotificationType.follow,
                    user_ids: [numericFollowingId],
                    is_user: true,
                });
            } catch (error) {
                console.error('Failed to send follow notification:', error);
            }
        }

        return savedFollow;
    }

    async unfollow(followerId: number | string, followingId: number | string) {
        const numericFollowerId = await this.resolveNumericId(followerId);
        const numericFollowingId = await this.resolveNumericId(followingId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.articleServiceProxy.unfollow(numericFollowerId, numericFollowingId);
    }

    async getFollowedIds(followerId: number | string): Promise<number[]> {
        const numericFollowerId = await this.resolveNumericId(followerId);
        return await this.articleServiceProxy.getFollowedIds(numericFollowerId);
    }

    async getFollowedUuids(followerId: number | string): Promise<string[]> {
        const ids = await this.getFollowedIds(followerId);
        if (ids.length === 0) return [];

        const users = await this.userRepository.findBy({ id: In(ids) });
        return users.map((u) => u.uuid);
    }

    async getFollowerIds(followingId: number | string): Promise<number[]> {
        const numericFollowingId = await this.resolveNumericId(followingId);
        return await this.articleServiceProxy.getFollowerIds(numericFollowingId);
    }
}

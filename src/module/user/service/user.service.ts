import { UserEntity } from '../entity/user.entity';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import {
    UserDTO,
    UpdateUserDTO,
    UserSummaryDTO,
    UserDetailDTO,
    UserStatus,
    LoginType,
} from '../dtos/user.dto';
import { CountryEntity } from '@/common/entity/country.entity';
import { SupplierEntity } from '../entity/supplier.entity';
import { RoleEntity } from '../entity/role.entity';

export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getAllUsers(): Promise<UserSummaryDTO[]> {
        const users = await this.userRepository.find({
            relations: ['country', 'supplier', 'role'],
            order: { created_at: 'DESC' },
        });
        return users.map(
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
                    created_at: u.created_at,
                    updated_at: u.updated_at,
                    deleted_at: u.deleted_at ?? undefined,
                } as Partial<UserSummaryDTO>),
        );
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
        user.username = dto.username ?? user.username;
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
        user.updated_at = dto.updated_at ?? new Date();
        await this.userRepository.save(user);
        return this.getUserById(id);
    }

    async removeUser(id: number): Promise<boolean> {
        const res = await this.userRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }
}

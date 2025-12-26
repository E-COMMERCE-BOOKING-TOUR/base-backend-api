import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '../entity/role.entity';
import { PermissionEntity } from '../entity/permission.entity';
import { CreateRoleDTO } from '../dtos/admin/create-role.dto';
import { UpdateRoleDTO } from '../dtos/admin/update-role.dto';

@Injectable()
export class AdminRoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    async getAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: RoleEntity[];
        total_items: number;
        total_pages: number;
        current_page: number;
    }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.roleRepository.findAndCount({
            relations: ['permissions', 'users'],
            order: { created_at: 'DESC' },
            take: limit,
            skip: skip,
        });

        return {
            data,
            total_items: total,
            total_pages: Math.ceil(total / limit),
            current_page: page,
        };
    }

    async getById(id: number): Promise<RoleEntity | null> {
        return this.roleRepository.findOne({
            where: { id },
            relations: ['permissions', 'users'],
        });
    }

    async create(dto: CreateRoleDTO): Promise<RoleEntity> {
        const role = this.roleRepository.create({
            name: dto.name,
            desciption: dto.desciption,
        });

        if (dto.permission_ids && dto.permission_ids.length > 0) {
            const permissions = await this.permissionRepository.findBy({
                id: In(dto.permission_ids),
            });
            role.permissions = permissions;
        }

        return this.roleRepository.save(role);
    }

    async update(id: number, dto: UpdateRoleDTO): Promise<RoleEntity | null> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) return null;

        if (dto.name !== undefined) role.name = dto.name;
        if (dto.desciption !== undefined) role.desciption = dto.desciption;

        if (dto.permission_ids !== undefined) {
            if (dto.permission_ids.length > 0) {
                const permissions = await this.permissionRepository.findBy({
                    id: In(dto.permission_ids),
                });
                role.permissions = permissions;
            } else {
                role.permissions = [];
            }
        }

        return this.roleRepository.save(role);
    }

    async remove(id: number): Promise<boolean> {
        // Check if any users are assigned to this role
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!role) return false;

        if (role.users && role.users.length > 0) {
            throw new BadRequestException(
                `Không thể xóa role này vì còn ${role.users.length} người dùng đang sử dụng`,
            );
        }

        const result = await this.roleRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
}

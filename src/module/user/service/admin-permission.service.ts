import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entity/permission.entity';
import { CreatePermissionDTO } from '../dtos/admin/create-permission.dto';
import { UpdatePermissionDTO } from '../dtos/admin/update-permission.dto';

@Injectable()
export class AdminPermissionService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    async getAll(): Promise<PermissionEntity[]> {
        return this.permissionRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async getById(id: number): Promise<PermissionEntity | null> {
        return this.permissionRepository.findOne({
            where: { id },
        });
    }

    async create(dto: CreatePermissionDTO): Promise<PermissionEntity> {
        const permission = this.permissionRepository.create({
            permission_name: dto.permission_name,
            description: dto.description,
        });
        return this.permissionRepository.save(permission);
    }

    async update(
        id: number,
        dto: UpdatePermissionDTO,
    ): Promise<PermissionEntity | null> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
        });
        if (!permission) return null;

        if (dto.permission_name !== undefined)
            permission.permission_name = dto.permission_name;
        if (dto.description !== undefined)
            permission.description = dto.description;

        return this.permissionRepository.save(permission);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.permissionRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
}

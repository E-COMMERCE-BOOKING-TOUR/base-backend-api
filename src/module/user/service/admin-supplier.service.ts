import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from '../entity/supplier.entity';
import { CreateSupplierDTO } from '../dtos/admin/create-supplier.dto';
import { UpdateSupplierDTO } from '../dtos/admin/update-supplier.dto';

@Injectable()
export class AdminSupplierService {
    constructor(
        @InjectRepository(SupplierEntity)
        private readonly supplierRepository: Repository<SupplierEntity>,
    ) {}

    async getAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: SupplierEntity[];
        total_items: number;
        total_pages: number;
        current_page: number;
    }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.supplierRepository.findAndCount({
            relations: ['users', 'tours'],
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

    async getById(id: number): Promise<SupplierEntity | null> {
        return this.supplierRepository.findOne({
            where: { id },
            relations: ['users', 'tours'],
        });
    }

    async create(dto: CreateSupplierDTO): Promise<SupplierEntity> {
        const supplier = this.supplierRepository.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            status: dto.status ?? 'inactive',
        });
        return this.supplierRepository.save(supplier);
    }

    async update(
        id: number,
        dto: UpdateSupplierDTO,
    ): Promise<SupplierEntity | null> {
        const supplier = await this.supplierRepository.findOne({
            where: { id },
        });
        if (!supplier) return null;

        if (dto.name !== undefined) supplier.name = dto.name;
        if (dto.email !== undefined) supplier.email = dto.email;
        if (dto.phone !== undefined) supplier.phone = dto.phone;
        if (dto.status !== undefined) supplier.status = dto.status;

        return this.supplierRepository.save(supplier);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.supplierRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
}

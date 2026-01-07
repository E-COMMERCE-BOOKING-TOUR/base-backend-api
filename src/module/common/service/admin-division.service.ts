import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { DivisionEntity } from '@/common/entity/division.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import {
    CreateDivisionDTO,
    UpdateDivisionDTO,
} from '../dto/admin-division.dto';

export interface DivisionQueryDTO {
    page?: number;
    limit?: number;
    keyword?: string;
    country_id?: number;
    parent_id?: number | null;
}

export interface PaginatedDivisionsResponse {
    data: DivisionEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class AdminDivisionService {
    constructor(
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: Repository<DivisionEntity>,
        @InjectRepository(CountryEntity)
        private readonly countryRepository: Repository<CountryEntity>,
    ) { }

    async getAll(query: DivisionQueryDTO = {}): Promise<PaginatedDivisionsResponse> {
        const { page = 1, limit = 20, keyword, country_id, parent_id } = query;
        const skip = (page - 1) * limit;

        const qb = this.divisionRepository
            .createQueryBuilder('division')
            .leftJoinAndSelect('division.country', 'country')
            .leftJoinAndSelect('division.parent', 'parent')
            .orderBy('division.name', 'ASC');

        if (keyword) {
            qb.andWhere(
                '(division.name LIKE :keyword OR division.name_local LIKE :keyword OR division.code LIKE :keyword)',
                { keyword: `%${keyword}%` },
            );
        }

        if (country_id) {
            qb.andWhere('division.country_id = :country_id', { country_id });
        }

        // parent_id can be: undefined (no filter), null (get root divisions), or number (get children of parent)
        if (parent_id !== undefined) {
            if (parent_id === null || parent_id === 0) {
                qb.andWhere('division.parent_id IS NULL');
            } else {
                qb.andWhere('division.parent_id = :parent_id', { parent_id });
            }
        }

        const [data, total] = await qb
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getByCountry(countryId: number): Promise<DivisionEntity[]> {
        return this.divisionRepository.find({
            where: { country: { id: countryId } },
            relations: ['country', 'parent'],
            order: { name_local: 'ASC' },
        });
    }

    async getCountries(): Promise<CountryEntity[]> {
        return this.countryRepository.find({ order: { name: 'ASC' } });
    }

    async getById(id: number): Promise<DivisionEntity> {
        const division = await this.divisionRepository.findOne({
            where: { id },
            relations: ['country', 'parent', 'children'],
        });
        if (!division) {
            throw new NotFoundException(`Division với ID ${id} không tồn tại`);
        }
        return division;
    }

    async create(dto: CreateDivisionDTO): Promise<DivisionEntity> {
        const division = this.divisionRepository.create({
            name: dto.name,
            name_local: dto.name_local,
            level: dto.level?.toString() || '1',
            code: dto.code ?? undefined,
            image_url: dto.image_url ?? undefined,
            country: { id: dto.country_id } as CountryEntity,
            parent_id: dto.parent_id ?? undefined,
        });
        return this.divisionRepository.save(division);
    }

    async update(id: number, dto: UpdateDivisionDTO): Promise<DivisionEntity> {
        const division = await this.getById(id);

        if (dto.name !== undefined) division.name = dto.name;
        if (dto.name_local !== undefined) division.name_local = dto.name_local;
        if (dto.level !== undefined) division.level = dto.level.toString();
        if (dto.code !== undefined) division.code = dto.code;
        if (dto.image_url !== undefined) division.image_url = dto.image_url;
        if (dto.country_id !== undefined) {
            division.country = { id: dto.country_id } as CountryEntity;
        }
        if (dto.parent_id !== undefined) {
            division.parent_id = dto.parent_id;
        }

        return this.divisionRepository.save(division);
    }

    async remove(id: number): Promise<void> {
        const division = await this.getById(id);
        await this.divisionRepository.remove(division);
    }

    async incrementViewCount(id: number): Promise<void> {
        await this.divisionRepository.increment({ id }, 'view_count', 1);
    }
}

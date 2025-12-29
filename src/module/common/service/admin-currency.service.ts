import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import {
    CreateCurrencyDTO,
    UpdateCurrencyDTO,
} from '../dto/admin-currency.dto';

@Injectable()
export class AdminCurrencyService {
    constructor(
        @InjectRepository(CurrencyEntity)
        private readonly currencyRepository: Repository<CurrencyEntity>,
    ) {}

    async getAll(): Promise<CurrencyEntity[]> {
        return this.currencyRepository.find({
            order: { name: 'ASC' },
        });
    }

    async getById(id: number): Promise<CurrencyEntity> {
        const currency = await this.currencyRepository.findOne({
            where: { id },
        });
        if (!currency) {
            throw new NotFoundException(`Currency với ID ${id} không tồn tại`);
        }
        return currency;
    }

    async create(dto: CreateCurrencyDTO): Promise<CurrencyEntity> {
        const currency = this.currencyRepository.create({
            name: dto.name,
            symbol: dto.symbol,
        });
        return this.currencyRepository.save(currency);
    }

    async update(id: number, dto: UpdateCurrencyDTO): Promise<CurrencyEntity> {
        const currency = await this.getById(id);

        if (dto.name !== undefined) currency.name = dto.name;
        if (dto.symbol !== undefined) currency.symbol = dto.symbol;

        return this.currencyRepository.save(currency);
    }

    async remove(id: number): Promise<void> {
        const currency = await this.getById(id);
        await this.currencyRepository.remove(currency);
    }
}

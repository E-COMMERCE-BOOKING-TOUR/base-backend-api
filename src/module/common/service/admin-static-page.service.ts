import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaticPageEntity } from '@/common/entity/static-page.entity';
import {
    CreateStaticPageDTO,
    UpdateStaticPageDTO,
} from '../dto/static-page.dto';

@Injectable()
export class AdminStaticPageService {
    constructor(
        @InjectRepository(StaticPageEntity)
        private readonly staticPageRepository: Repository<StaticPageEntity>,
    ) {}

    async findAll(): Promise<StaticPageEntity[]> {
        return this.staticPageRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<StaticPageEntity> {
        const page = await this.staticPageRepository.findOne({ where: { id } });
        if (!page) {
            throw new NotFoundException(`Static page with ID ${id} not found`);
        }
        return page;
    }

    async findBySlug(slug: string): Promise<StaticPageEntity> {
        const page = await this.staticPageRepository.findOne({
            where: { slug, is_active: true },
        });
        if (!page) {
            throw new NotFoundException(
                `Static page with slug ${slug} not found`,
            );
        }
        return page;
    }

    async create(dto: CreateStaticPageDTO): Promise<StaticPageEntity> {
        const existing = await this.staticPageRepository.findOne({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new ConflictException(`Slug ${dto.slug} is already in use`);
        }

        const page = this.staticPageRepository.create(dto);
        return this.staticPageRepository.save(page);
    }

    async update(
        id: number,
        dto: UpdateStaticPageDTO,
    ): Promise<StaticPageEntity> {
        const page = await this.findOne(id);

        if (dto.slug && dto.slug !== page.slug) {
            const existing = await this.staticPageRepository.findOne({
                where: { slug: dto.slug },
            });
            if (existing) {
                throw new ConflictException(
                    `Slug ${dto.slug} is already in use`,
                );
            }
        }

        Object.assign(page, dto);
        return this.staticPageRepository.save(page);
    }

    async remove(id: number): Promise<void> {
        const page = await this.findOne(id);
        await this.staticPageRepository.remove(page);
    }
}

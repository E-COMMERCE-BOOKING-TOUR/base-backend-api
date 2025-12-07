import { Injectable } from '@nestjs/common';
import { DivisionEntity } from '@/common/entity/division.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDivisionTrendingDTO } from '../dto/division.dto';

@Injectable()
export class DivisionService {
    constructor(
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: Repository<DivisionEntity>,
    ) {}

    async getTrendingDestinations(
        limit: number = 6,
    ): Promise<UserDivisionTrendingDTO[]> {
        const divisions = await this.divisionRepository
            .createQueryBuilder('division')
            .leftJoin('division.country', 'country')
            .leftJoin(
                'division.tours',
                'tours',
                'tours.status = :status AND tours.is_visible = :isVisible',
                {
                    status: 'active',
                    isVisible: true,
                },
            )
            .select('division.id', 'id')
            .addSelect('division.name', 'name')
            .addSelect('country.iso3', 'countryCode')
            .addSelect('COUNT(tours.id)', 'toursCount')
            .where('division.level = :level', { level: 1 })
            .groupBy('division.id')
            .addGroupBy('division.name')
            .addGroupBy('country.iso3')
            .orderBy('toursCount', 'DESC')
            .addOrderBy('division.name', 'ASC')
            .limit(limit)
            .getRawMany();

        return divisions.map((division): UserDivisionTrendingDTO => {
            const flag: string = this.getCountryFlag(division.countryCode);
            const title: string = division.name.toUpperCase();
            const toursCount: number = parseInt(division.toursCount) || 0;
            const image: string = `/assets/images/${division.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;

            return new UserDivisionTrendingDTO({
                id: division.id,
                title,
                image,
                toursCount,
                flag,
            });
        });
    }

    private getCountryFlag(countryCode: string): string {
        const flagEmojis: Record<string, string> = {
            VN: '🇻🇳',
            VNM: '🇻🇳',
            TH: '🇹🇭',
            THA: '🇹🇭',
            JP: '🇯🇵',
            JPN: '🇯🇵',
            KR: '🇰🇷',
            KOR: '🇰🇷',
            US: '🇺🇸',
            USA: '🇺🇸',
        };
        return flagEmojis[countryCode] || '🌍';
    }
}

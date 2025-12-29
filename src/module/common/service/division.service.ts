import { Injectable } from '@nestjs/common';
import { DivisionEntity } from '@/common/entity/division.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDivisionTrendingDTO } from '../dto/division.dto';

interface RawTrendingDivision {
    id: number;
    name: string;
    countryCode: string;
    toursCount: string;
    imageUrl: string | null;
    viewCount: string;
}

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
            .addSelect('division.image_url', 'imageUrl')
            .addSelect('division.view_count', 'viewCount')
            .addSelect('country.iso3', 'countryCode')
            .addSelect('COUNT(tours.id)', 'toursCount')
            .where('division.level = :level', { level: 1 })
            .groupBy('division.id')
            .addGroupBy('division.name')
            .addGroupBy('division.image_url')
            .addGroupBy('division.view_count')
            .addGroupBy('country.iso3')
            .orderBy('division.view_count', 'DESC')
            .addOrderBy('toursCount', 'DESC')
            .addOrderBy('division.name', 'ASC')
            .limit(limit)
            .getRawMany<RawTrendingDivision>();

        return divisions.map(
            (division: RawTrendingDivision): UserDivisionTrendingDTO => {
                const flag: string = this.getCountryFlag(division.countryCode);
                const title: string = division.name.toUpperCase();
                const toursCount: number = parseInt(division.toursCount) || 0;
                // Use database image or fallback to generated path
                const image: string =
                    division.imageUrl ||
                    `/assets/images/${division.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;

                return new UserDivisionTrendingDTO({
                    id: division.id,
                    title,
                    image,
                    toursCount,
                    flag,
                });
            },
        );
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

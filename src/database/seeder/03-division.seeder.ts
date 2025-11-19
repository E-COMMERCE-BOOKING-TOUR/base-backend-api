import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { DivisionEntity } from '@/common/entity/division.entity';
import { CountryEntity } from '@/common/entity/country.entity';

export default class DivisionSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const divisionRepository = dataSource.getRepository(DivisionEntity);
        const countryRepository = dataSource.getRepository(CountryEntity);

        // Get Vietnam
        const vietnam = await countryRepository.findOne({
            where: { iso3: 'VN' },
        });
        if (!vietnam) {
            console.log('Vietnam not found, skipping division seeder');
            return;
        }

        // Vietnamese provinces/cities
        const vietnamDivisions = [
            { name: 'Hanoi', name_local: 'Hà Nội', code: 'HN', level: '1' },
            {
                name: 'Ho Chi Minh City',
                name_local: 'Thành phố Hồ Chí Minh',
                code: 'SG',
                level: '1',
            },
            { name: 'Da Nang', name_local: 'Đà Nẵng', code: 'DN', level: '1' },
            {
                name: 'Hai Phong',
                name_local: 'Hải Phòng',
                code: 'HP',
                level: '1',
            },
            { name: 'Can Tho', name_local: 'Cần Thơ', code: 'CT', level: '1' },
            {
                name: 'Hue',
                name_local: 'Thừa Thiên Huế',
                code: 'TT',
                level: '1',
            },
            {
                name: 'Nha Trang',
                name_local: 'Khánh Hòa',
                code: 'KH',
                level: '1',
            },
            { name: 'Da Lat', name_local: 'Lâm Đồng', code: 'LD', level: '1' },
            {
                name: 'Vung Tau',
                name_local: 'Bà Rịa - Vũng Tàu',
                code: 'VT',
                level: '1',
            },
            {
                name: 'Phu Quoc',
                name_local: 'Phú Quốc',
                code: 'PQ',
                level: '1',
            },
            {
                name: 'Ha Long',
                name_local: 'Quảng Ninh',
                code: 'QN',
                level: '1',
            },
            { name: 'Sapa', name_local: 'Lào Cai', code: 'LC', level: '1' },
            {
                name: 'Hoi An',
                name_local: 'Quảng Nam',
                code: 'QNA',
                level: '1',
            },
            {
                name: 'Phan Thiet',
                name_local: 'Bình Thuận',
                code: 'BT',
                level: '1',
            },
            {
                name: 'Quy Nhon',
                name_local: 'Bình Định',
                code: 'BD',
                level: '1',
            },
        ];

        for (const division of vietnamDivisions) {
            const exists = await divisionRepository.findOne({
                where: { code: division.code, country: { id: vietnam.id } },
            });
            if (!exists) {
                await divisionRepository.save(
                    divisionRepository.create({
                        ...division,
                        country: vietnam,
                        parent_id: null,
                    }),
                );
            }
        }

        // Get Thailand
        const thailand = await countryRepository.findOne({
            where: { iso3: 'TH' },
        });
        if (thailand) {
            const thailandDivisions = [
                {
                    name: 'Bangkok',
                    name_local: 'กรุงเทพมหานคร',
                    code: 'BKK',
                    level: '1',
                },
                {
                    name: 'Phuket',
                    name_local: 'ภูเก็ต',
                    code: 'PHK',
                    level: '1',
                },
                {
                    name: 'Chiang Mai',
                    name_local: 'เชียงใหม่',
                    code: 'CM',
                    level: '1',
                },
                {
                    name: 'Pattaya',
                    name_local: 'พัทยา',
                    code: 'PTY',
                    level: '1',
                },
                {
                    name: 'Krabi',
                    name_local: 'กระบี่',
                    code: 'KRB',
                    level: '1',
                },
            ];

            for (const division of thailandDivisions) {
                const exists = await divisionRepository.findOne({
                    where: {
                        code: division.code,
                        country: { id: thailand.id },
                    },
                });
                if (!exists) {
                    await divisionRepository.save(
                        divisionRepository.create({
                            ...division,
                            country: thailand,
                            parent_id: null,
                        }),
                    );
                }
            }
        }

        // Get Singapore
        const singapore = await countryRepository.findOne({
            where: { iso3: 'SG' },
        });
        if (singapore) {
            const singaporeDivisions = [
                {
                    name: 'Central Region',
                    name_local: 'Central Region',
                    code: 'CR',
                    level: '1',
                },
                {
                    name: 'Sentosa',
                    name_local: 'Sentosa',
                    code: 'STS',
                    level: '1',
                },
            ];

            for (const division of singaporeDivisions) {
                const exists = await divisionRepository.findOne({
                    where: {
                        code: division.code,
                        country: { id: singapore.id },
                    },
                });
                if (!exists) {
                    await divisionRepository.save(
                        divisionRepository.create({
                            ...division,
                            country: singapore,
                            parent_id: null,
                        }),
                    );
                }
            }
        }

        console.log('Division seeded');
    }
}

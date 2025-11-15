import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourImageEntity } from '@/module/tour/entity/tourImage.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';

export default class TourImageSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const imageRepository = dataSource.getRepository(TourImageEntity);
        const tourRepository = dataSource.getRepository(TourEntity);

        const tours = await tourRepository.find();

        if (tours.length === 0) {
            console.log('⚠️ No tours found, skipping tour image seeder');
            return;
        }

        const imageUrls = {
            saigon: [
                'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
                'https://images.unsplash.com/photo-1562185802-f279d5e2a31f',
            ],
            halong: [
                'https://images.unsplash.com/photo-1528127269322-539801943592',
                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
                'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
            ],
            sapa: [
                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
                'https://images.unsplash.com/photo-1528127269322-539801943592',
                'https://images.unsplash.com/photo-1562185802-f279d5e2a31f',
            ],
            hoian: [
                'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
                'https://images.unsplash.com/photo-1528127269322-539801943592',
                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
            ],
            beach: [
                'https://images.unsplash.com/photo-1562185802-f279d5e2a31f',
                'https://images.unsplash.com/photo-1528127269322-539801943592',
                'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
            ],
        };

        for (const tour of tours) {
            let urls: string[] = [];
            if (tour.slug.includes('saigon') || tour.slug.includes('chi-minh')) {
                urls = imageUrls.saigon;
            } else if (tour.slug.includes('halong')) {
                urls = imageUrls.halong;
            } else if (tour.slug.includes('sapa')) {
                urls = imageUrls.sapa;
            } else if (tour.slug.includes('hoi-an')) {
                urls = imageUrls.hoian;
            } else if (tour.slug.includes('nha-trang') || tour.slug.includes('phu-quoc')) {
                urls = imageUrls.beach;
            } else {
                urls = imageUrls.saigon;
            }

            for (let i = 0; i < urls.length; i++) {
                const exists = await imageRepository.findOne({
                    where: { tour: { id: tour.id }, sort_no: i + 1 },
                });
                if (!exists) {
                    await imageRepository.save(
                        imageRepository.create({
                            image_url: urls[i],
                            sort_no: i + 1,
                            is_cover: i === 0,
                            tour: tour,
                        }),
                    );
                }
            }
        }

        console.log('Tour Image seeded');
    }
}


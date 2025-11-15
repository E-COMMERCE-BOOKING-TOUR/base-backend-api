import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ReviewImageEntity } from '@/module/review/entity/reviewImage.entity';
import { ReviewEntity } from '@/module/review/entity/review.entity';

export default class ReviewImageSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const imageRepository = dataSource.getRepository(ReviewImageEntity);
        const reviewRepository = dataSource.getRepository(ReviewEntity);

        const reviews = await reviewRepository.find({ 
            where: { status: 'approved' },
            take: 30, // Only add images to some reviews
        });

        if (reviews.length === 0) {
            console.log('⚠️ No approved reviews found, skipping review image seeder');
            return;
        }

        const imageUrls = [
            'https://images.unsplash.com/photo-1528127269322-539801943592',
            'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
            'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
            'https://images.unsplash.com/photo-1562185802-f279d5e2a31f',
            'https://images.unsplash.com/photo-1540611025311-01df3cef54b5',
        ];

        for (const review of reviews) {
            // 60% of reviews have images
            if (Math.random() > 0.4) {
                // Add 1-3 images per review
                const numImages = Math.floor(Math.random() * 3) + 1;
                
                for (let i = 0; i < numImages; i++) {
                    const exists = await imageRepository.findOne({
                        where: { review: { id: review.id }, sort_no: i + 1 },
                    });
                    if (!exists) {
                        await imageRepository.save(
                            imageRepository.create({
                                image_url: imageUrls[Math.floor(Math.random() * imageUrls.length)],
                                sort_no: i + 1,
                                is_visible: true,
                                review: review,
                            }),
                        );
                    }
                }
            }
        }

        console.log('Review Image seeded');
    }
}


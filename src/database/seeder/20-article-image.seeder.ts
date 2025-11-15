import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ArticleImageEntity } from '@/module/article/entity/articleImage.entity';
import { ArticleEntity } from '@/module/article/entity/article.entity';

export default class ArticleImageSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const imageRepository = dataSource.getRepository(ArticleImageEntity);
        const articleRepository = dataSource.getRepository(ArticleEntity);

        const articles = await articleRepository.find({ where: { is_visible: true } });

        if (articles.length === 0) {
            console.log('⚠️ No articles found, skipping article image seeder');
            return;
        }

        const imageUrls = [
            'https://images.unsplash.com/photo-1528127269322-539801943592',
            'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
            'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
            'https://images.unsplash.com/photo-1562185802-f279d5e2a31f',
            'https://images.unsplash.com/photo-1540611025311-01df3cef54b5',
        ];

        for (const article of articles) {
            // Add 2-3 images per article
            const numImages = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numImages; i++) {
                const exists = await imageRepository.findOne({
                    where: { 
                        article: { id: article.id },
                        image_url: imageUrls[i % imageUrls.length]
                    },
                });
                if (!exists) {
                    await imageRepository.save(
                        imageRepository.create({
                            image_url: imageUrls[i % imageUrls.length],
                            article: article,
                        }),
                    );
                }
            }
        }

        console.log('Article Image seeded');
    }
}


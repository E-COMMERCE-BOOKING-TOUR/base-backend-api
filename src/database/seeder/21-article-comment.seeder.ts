import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ArticleCommentEntity } from '@/module/article/entity/articleComment.entity';
import { ArticleEntity } from '@/module/article/entity/article.entity';
import { UserEntity } from '@/module/user/entity/user.entity';

export default class ArticleCommentSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const commentRepository = dataSource.getRepository(ArticleCommentEntity);
        const articleRepository = dataSource.getRepository(ArticleEntity);
        const userRepository = dataSource.getRepository(UserEntity);

        const articles = await articleRepository.find({ where: { is_visible: true } });
        const customers = await userRepository.find({
            where: { role: { name: 'customer' } },
            take: 10,
        });

        if (articles.length === 0 || customers.length === 0) {
            console.log('⚠️ No articles or customers found, skipping comment seeder');
            return;
        }

        const commentTexts = [
            'Great article! Very informative and helpful for planning my trip.',
            'Thanks for sharing these tips. I\'m excited to visit Vietnam soon!',
            'I visited some of these places last year and they were amazing!',
            'This is exactly what I was looking for. Bookmarking for my trip next month.',
            'Beautiful photos! Can\'t wait to experience this myself.',
            'Any recommendations for budget accommodation in these areas?',
            'How many days would you recommend for visiting all these places?',
            'I love Vietnamese food! The street food is incredible.',
            'Very detailed guide. Much appreciated!',
            'This article convinced me to add Vietnam to my travel list.',
        ];

        const replyTexts = [
            'I agree! Vietnam is such an amazing destination.',
            'Thanks for the recommendation!',
            'I had a similar experience when I visited.',
            'That\'s a great question, I\'d like to know too.',
            'Glad you found it helpful!',
        ];

        for (const article of articles.slice(0, 7)) {
            // Add 3-6 comments per article
            const numComments = Math.floor(Math.random() * 4) + 3;
            
            for (let i = 0; i < numComments; i++) {
                const user = customers[Math.floor(Math.random() * customers.length)];
                const content = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                
                const exists = await commentRepository.findOne({
                    where: {
                        article: { id: article.id },
                        user: { id: user.id },
                        content: content,
                    },
                });

                if (!exists) {
                    const comment = await commentRepository.save(
                        commentRepository.create({
                            content: content,
                            article: article,
                            user: user,
                            parent_id: null,
                        }),
                    );

                    // Add 0-2 replies to some comments
                    if (Math.random() > 0.5) {
                        const numReplies = Math.floor(Math.random() * 2) + 1;
                        for (let j = 0; j < numReplies; j++) {
                            const replyUser = customers[Math.floor(Math.random() * customers.length)];
                            const replyContent = replyTexts[Math.floor(Math.random() * replyTexts.length)];
                            
                            await commentRepository.save(
                                commentRepository.create({
                                    content: replyContent,
                                    article: article,
                                    user: replyUser,
                                    parent_id: comment.id,
                                }),
                            );
                        }
                    }
                }
            }
        }

        console.log('Article Comment seeded');
    }
}


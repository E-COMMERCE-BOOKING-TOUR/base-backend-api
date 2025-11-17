import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleEntity } from "../entity/article.entity";
import { Repository } from "typeorm";
import { UserArticlePopularDTO } from "../dto/article.dto";

@Injectable()
export class UserArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
    ) {}

    async getPopularArticles(limit: number = 10): Promise<UserArticlePopularDTO[]> {
        const articles = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.images', 'images')
            .leftJoinAndSelect('article.user', 'user')
            .where('article.is_visible = :isVisible', { isVisible: true })
            .orderBy('article.count_views', 'DESC')
            .addOrderBy('article.count_likes', 'DESC')
            .addOrderBy('article.created_at', 'DESC')
            .take(limit)
            .getMany();

        return articles.map((article): UserArticlePopularDTO => {
            const firstImage = article.images?.[0];
            const imageUrl: string = firstImage?.image_url || '/assets/images/travel.jpg';
            const description: string = article.content?.substring(0, 150) + '...' || '';
            const timestamp: string = this.getRelativeTime(article.created_at);
            const tags: string[] = [];

            return new UserArticlePopularDTO({
                id: article.id,
                title: article.title,
                description,
                image: imageUrl,
                tags,
                timestamp,
                views: article.count_views,
                likes: article.count_likes,
                comments: article.count_comments,
            });
        });
    }

    private getRelativeTime(date: Date): string {
        const now: Date = new Date();
        const diff: number = now.getTime() - new Date(date).getTime();
        const seconds: number = Math.floor(diff / 1000);
        const minutes: number = Math.floor(seconds / 60);
        const hours: number = Math.floor(minutes / 60);
        const days: number = Math.floor(hours / 24);
        const months: number = Math.floor(days / 30);
        const years: number = Math.floor(days / 365);

        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
}
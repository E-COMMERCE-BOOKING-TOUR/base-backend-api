import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ArticleDetailDTO } from '../dto/article.dto';

export interface ArticleResponse {
    _id: string;
    title: string;
    content: string;
    images?: Array<{ image_url: string }>;
    created_at: string;
    count_views: number;
    count_likes: number;
    count_comments: number;
    user?: { name: string; avatar: string };
}

@Injectable()
export class ArticleServiceProxy {
    constructor(
        @Inject('ARTICLE_SERVICE') private readonly client: ClientProxy,
    ) {}

    async getArticleBySlug(slug: string): Promise<ArticleResponse> {
        return lastValueFrom(this.client.send('getArticleBySlug', slug));
    }

    async createArticle(userUuid: string, dto: ArticleDetailDTO) {
        console.log('DTO: ', dto);
        const article: ArticleDetailDTO = {
            ...dto,
            user_uuid: userUuid,
            count_likes: 0,
            count_views: 0,
            count_comments: 0,
            tour_id: 1,
            comments: [],
            users_like: [],
            is_visible: true,
        };
        return lastValueFrom(this.client.send('create_article', article));
    }

    async getAllArticles(): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('get_all_articles', {}));
    }

    async deleteArticle(id: string, userId: number): Promise<void> {
        return lastValueFrom(this.client.send('deleteArticle', { id, userId }));
    }

    async createArticle(
        userId: number,
        dto: unknown,
    ): Promise<ArticleResponse> {
        return lastValueFrom(
            this.client.send('createArticle', { userId, dto }),
        );
    }

    async updateArticle(
        id: string,
        userId: number,
        dto: unknown,
    ): Promise<ArticleResponse> {
        return lastValueFrom(
            this.client.send('updateArticle', { id, userId, dto }),
        );
    }

    async removeArticle(id: number | string): Promise<void> {
        return lastValueFrom(this.client.send('remove_article', id));
    }

    async addComment(
        articleId: string,
        userId: number,
        content: string,
    ): Promise<void> {
        return lastValueFrom(
            this.client.send('addComment', { articleId, userId, content }),
        );
    }

    async likeArticle(id: string, userId: number): Promise<void> {
        return lastValueFrom(this.client.send('likeArticle', { id, userId }));
    }

    async unlikeArticle(
        articleId: number | string,
        userId: number,
    ): Promise<void> {
        return lastValueFrom(
            this.client.send('unlike_article', { articleId, userId }),
        );
    }

    async getPopularArticles(limit: number): Promise<ArticleDetailDTO[]> {
        const response: any = await lastValueFrom(
            this.client.send('get_popular_articles', limit),
        );
        const result: ArticleDetailDTO[] = response.map((article: any) => ({
            id: article?._id,
            title: article?.title,
            content: article?.content
                ? article.content.substring(0, 100) + '...'
                : '',
            images: article?.images || [],
            tags: article?.tags || [],
            created_at: article?.created_at,
            count_views: article?.count_views,
            count_likes: article?.count_likes,
            count_comments: article?.count_comments,
            comments: article?.comments || [],
            tour_id: article?.tour_id,
            user_uuid: article?.user_uuid,
            users_like: article?.users_like || [],
            is_visible: article?.is_visible,
            updated_at: article?.updated_at,
            deleted_at: article?.deleted_at,
        }));
        return result;
    }
}

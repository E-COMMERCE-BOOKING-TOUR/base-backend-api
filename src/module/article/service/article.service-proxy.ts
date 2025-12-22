import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

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

    async getArticles(query: any): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('getArticles', query));
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

    async getPopularArticles(): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('getPopularArticles', {}));
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ArticleCommentDetailDTO, ArticleDetailDTO } from '../dto/article.dto';

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
    ) { }

    async getArticleBySlug(slug: string): Promise<ArticleResponse> {
        return lastValueFrom(this.client.send('getArticleBySlug', slug));
    }

    async createArticle(userId: number, dto: ArticleDetailDTO): Promise<any> {
        const article: ArticleDetailDTO = {
            ...dto,
            user_id: userId,
            count_likes: 0,
            count_views: 0,
            count_comments: 0,
            tour_id: dto.tour_id ?? undefined,
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

    async getPopularArticles(limit: number): Promise<any[]> {
        const response: any[] = await lastValueFrom(
            this.client.send('get_popular_articles', limit),
        );
        const result = response.map((article) => ({
            id: article?._id,
            title: article?.title,
            content: article?.content
                ? article.content.substring(0, 100) + '...'
                : '',
            images: article?.images || [],
            tags: article?.tags || [],
            count_views: article?.count_views,
            count_likes: article?.count_likes,
            count_comments: article?.count_comments,
            tour_id: article?.tour_id,
            user_id: article?.user_id,
            users_like: article?.users_like || [],
            is_visible: article?.is_visible,
            comments:
                article.comments.map((comment: ArticleCommentDetailDTO) => ({
                    id: comment.id,
                    content: comment.content,
                    parent_id: comment.parent_id,
                    user_id: comment.user_id,
                    created_at: comment.created_at,
                    updated_at: comment.updated_at,
                })) || [],
            created_at: article?.created_at,
            updated_at: article?.updated_at,
            deleted_at: article?.deleted_at,
        }));

        return result;
    }

    async getArticlesByTag(tag: string, limit: number): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('get_articles_by_tag', { tag, limit }));
    }

    async getArticlesByUser(userId: number): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('get_articles_by_user', userId));
    }

    async getArticlesLikedByUser(userId: number): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('get_articles_liked_by_user', userId));
    }

    async getTrendingTags(limit: number): Promise<{ _id: string, count: number }[]> {
        return lastValueFrom(this.client.send('get_trending_tags', limit));
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ArticleDetailDTO } from '../dto/article.dto';

@Injectable()
export class ArticleServiceProxy {
    constructor(
        @Inject('ARTICLE_SERVICE') private readonly client: ClientProxy,
    ) { }

    async getArticleById(id: number | string) {
        return lastValueFrom(this.client.send('get_article_by_id', id));
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

    async getAllArticles() {
        return lastValueFrom(this.client.send('get_all_articles', {}));
    }

    async getArticlesByUser(userId: number) {
        return lastValueFrom(this.client.send('get_articles_by_user', userId));
    }

    async updateArticle(id: number | string, dto: any) {
        return lastValueFrom(this.client.send('update_article', { id, dto }));
    }

    async removeArticle(id: number | string) {
        return lastValueFrom(this.client.send('remove_article', id));
    }

    async likeArticle(articleId: number | string, userId: number) {
        return lastValueFrom(this.client.send('like_article', { articleId, userId }));
    }

    async unlikeArticle(articleId: number | string, userId: number) {
        return lastValueFrom(this.client.send('unlike_article', { articleId, userId }));
    }

    async addComment(dto: any) {
        return lastValueFrom(this.client.send('add_comment', dto));
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

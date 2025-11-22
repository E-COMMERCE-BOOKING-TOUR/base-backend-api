import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ArticleServiceProxy {
    constructor(
        @Inject('ARTICLE_SERVICE') private readonly client: ClientProxy,
    ) { }

    async getArticleById(id: number | string) {
        return lastValueFrom(this.client.send('get_article_by_id', id));
    }

    async createArticle(dto: any) {
        return lastValueFrom(this.client.send('create_article', dto));
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

    async getPopularArticles(limit: number) {
        return lastValueFrom(this.client.send('get_popular_articles', limit));
    }
}

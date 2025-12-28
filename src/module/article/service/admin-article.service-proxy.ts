import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AdminArticleServiceProxy {
    constructor(
        @Inject('ARTICLE_SERVICE') private readonly client: ClientProxy,
    ) { }

    async getArticles(limit: number = 20, page: number = 1, filter: any = {}) {
        return lastValueFrom(this.client.send('admin_get_articles', { limit, page, filter }));
    }

    async deleteArticle(id: string) {
        return lastValueFrom(this.client.send('admin_delete_article', id));
    }

    async toggleVisibility(id: string) {
        return lastValueFrom(this.client.send('admin_toggle_visibility', id));
    }

    async getStats() {
        return lastValueFrom(this.client.send('admin_get_social_stats', {}));
    }
}

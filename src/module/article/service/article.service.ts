import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ArticleServiceProxy } from './article.service-proxy';
import {
    ArticleDetailDTO,
    ArticleDTO,
    ArticleSummaryDTO,
    ArticleImageDTO,
    ArticleImageDetailDTO,
    ArticleCommentDetailDTO,
} from '../dto/article.dto';

@Injectable()
export class ArticleService {
    constructor(
        private readonly proxy: ArticleServiceProxy,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    private async populateUser(article: any) {
        if (!article || !article.user_id) return article;
        const user = await this.userRepository.findOne({
            where: { id: article.user_id },
        });
        return { ...article, user };
    }

    private async populateUsers(articles: any[]) {
        return Promise.all(articles.map((a) => this.populateUser(a)));
    }

    async getAllArticles(): Promise<ArticleDTO[]> {
        const articles = await this.proxy.getAllArticles();
        const populated = await this.populateUsers(articles);
        return populated.map((a) => ({
            ...a,
            created_at: new Date(a.created_at),
            updated_at: new Date(a.updated_at),
        }));
    }

    async getArticlesByUser(userId: number): Promise<ArticleSummaryDTO[]> {
        const articles = await this.proxy.getArticlesByUser(userId);
        const populated = await this.populateUsers(articles);
        return populated.map((a) => new ArticleSummaryDTO(a));
    }

    async getArticleById(id: number): Promise<ArticleDetailDTO | null> {
        const article = await this.proxy.getArticleById(id);
        if (!article) return null;
        const populated = await this.populateUser(article);

        // Populate comments users
        if (populated.comments) {
            populated.comments = await Promise.all(populated.comments.map(async (c: any) => {
                const user = await this.userRepository.findOne({ where: { id: c.user_id } });
                return { ...c, user };
            }));
        }

        return new ArticleDetailDTO(populated);
    }

    async create(dto: ArticleDTO): Promise<ArticleDetailDTO> {
        const article = await this.proxy.createArticle(dto);
        return this.getArticleById(article._id || article.id) as Promise<ArticleDetailDTO>;
    }

    async update(id: number, dto: Partial<ArticleDTO>): Promise<ArticleDetailDTO | null> {
        await this.proxy.updateArticle(id, dto);
        return this.getArticleById(id);
    }

    async remove(id: number): Promise<boolean> {
        return await this.proxy.removeArticle(id);
    }

    async addComment(articleId: number, userId: number, content: string, parentId?: number): Promise<ArticleCommentDetailDTO | null> {
        const comment = await this.proxy.addComment({ article_id: articleId, user_id: userId, content, parent_id: parentId });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return new ArticleCommentDetailDTO({ ...comment, user });
    }

    async removeComment(commentId: number): Promise<boolean> {
        // Not implemented in proxy yet, assuming logic exists or will be added
        return false;
    }

    async like(articleId: number, userId: number): Promise<boolean> {
        return await this.proxy.likeArticle(articleId, userId);
    }

    async unlike(articleId: number, userId: number): Promise<boolean> {
        return await this.proxy.unlikeArticle(articleId, userId);
    }

    async addImages(articleId: number, images: ArticleImageDTO[]): Promise<ArticleImageDetailDTO[]> {
        // Not implemented in proxy yet
        return [];
    }

    async removeImage(imageId: number): Promise<boolean> {
        // Not implemented in proxy yet
        return false;
    }

    async incrementView(id: number): Promise<boolean> {
        // Not implemented in proxy yet
        return true;
    }

    async toggleVisible(id: number, visible: boolean): Promise<boolean> {
        // Not implemented in proxy yet
        return true;
    }
}

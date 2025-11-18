import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entity/article.entity';
import { ArticleImageEntity } from '../entity/articleImage.entity';
import { ArticleCommentEntity } from '../entity/articleComment.entity';
import {
    ArticleDetailDTO,
    ArticleImageDetailDTO,
    ArticleCommentDetailDTO,
    ArticleSummaryDTO,
    ArticleDTO,
    ArticleImageDTO,
} from '../dto/article.dto';
import { UserEntity } from '@/module/user/entity/user.entity';

export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(ArticleImageEntity)
        private readonly imageRepository: Repository<ArticleImageEntity>,
        @InjectRepository(ArticleCommentEntity)
        private readonly commentRepository: Repository<ArticleCommentEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getAllArticles(): Promise<ArticleDTO[]> {
        const articles = await this.articleRepository.find({
            relations: ['user', 'images'],
            order: { created_at: 'DESC' },
        });
        return articles.map(
            (a) =>
                ({
                    title: a.title,
                    content: a.content,
                    is_visible: a.is_visible,
                    user_id: a.user.id,
                    images: (a.images ?? []).map((img) => ({ image_url: img.image_url })),
                    created_at: a.created_at,
                    updated_at: a.updated_at,
                    deleted_at: a.deleted_at ?? undefined,
                } as ArticleDTO),
        );
    }

    async getArticlesByUser(userId: number): Promise<ArticleSummaryDTO[]> {
        const articles = await this.articleRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
        return articles.map(
            (a) =>
                new ArticleSummaryDTO({
                    id: a.id,
                    title: a.title,
                    count_views: a.count_views,
                    count_likes: a.count_likes,
                    count_comments: a.count_comments,
                    is_visible: a.is_visible,
                    user: a.user,
                    created_at: a.created_at,
                    updated_at: a.updated_at,
                    deleted_at: a.deleted_at ?? undefined,
                } as Partial<ArticleSummaryDTO>),
        );
    }

    async getArticleById(id: number): Promise<ArticleDetailDTO | null> {
        const a = await this.articleRepository.findOne({
            where: { id },
            relations: [
                'user',
                'images',
                'comments',
                'comments.user',
                'comments.parent',
            ],
        });
        if (!a) return null;
        return new ArticleDetailDTO({
            id: a.id,
            title: a.title,
            content: a.content,
            count_views: a.count_views,
            count_likes: a.count_likes,
            count_comments: a.count_comments,
            is_visible: a.is_visible,
            user: a.user,
            created_at: a.created_at,
            updated_at: a.updated_at,
            deleted_at: a.deleted_at ?? undefined,
            images: (a.images ?? []).map(
                (img) =>
                    new ArticleImageDetailDTO({
                        id: img.id,
                        image_url: img.image_url,
                    }),
            ),
            comments: (a.comments ?? []).map(
                (c) =>
                    new ArticleCommentDetailDTO({
                        id: c.id,
                        content: c.content,
                        user: c.user,
                        parent: c.parent ?? null,
                    } as Partial<ArticleCommentDetailDTO>),
            ),
        } as Partial<ArticleDetailDTO>);
    }

    async create(dto: ArticleDTO): Promise<ArticleDetailDTO> {
        const article = await this.articleRepository.save(
            this.articleRepository.create({
                title: dto.title,
                content: dto.content,
                is_visible: dto.is_visible ?? false,
                user: { id: dto.user_id },
            }),
        );

        if (dto.images?.length) {
            const imageEntities = dto.images.map((i: ArticleImageDTO) =>
                this.imageRepository.create({
                    image_url: i.image_url,
                    article,
                }),
            );
            await this.imageRepository.save(imageEntities);
            article.images = imageEntities;
        } else {
            article.images = [];
        }

        return (await this.getArticleById(article.id)) as ArticleDetailDTO;
    }

    async update(
        id: number,
        dto: Partial<ArticleDTO>,
    ): Promise<ArticleDetailDTO | null> {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) return null;
        article.title = dto.title ?? article.title;
        article.content = dto.content ?? article.content;
        article.is_visible = dto.is_visible ?? article.is_visible;
        await this.articleRepository.save(article);
        return this.getArticleById(id);
    }

    async remove(id: number): Promise<boolean> {
        const res = await this.articleRepository.delete({ id });
        return (res.affected ?? 0) > 0;
    }

    async addComment(
        articleId: number,
        userId: number,
        content: string,
        parentId?: number,
    ): Promise<ArticleCommentDetailDTO | null> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
        });
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const parent = parentId
            ? await this.commentRepository.findOne({ where: { id: parentId } })
            : null;
        if (!article || !user) return null;
        const comment = await this.commentRepository.save(
            this.commentRepository.create({
                content,
                article,
                user,
                parent: parent ?? undefined,
                parent_id: parentId ?? null,
            }),
        );
        return new ArticleCommentDetailDTO({
            id: comment.id,
            content: comment.content,
            user: user,
            parent: parent ?? null,
        } as Partial<ArticleCommentDetailDTO>);
    }

    async removeComment(commentId: number): Promise<boolean> {
        const res = await this.commentRepository.delete({ id: commentId });
        return (res.affected ?? 0) > 0;
    }

    async like(articleId: number, userId: number): Promise<boolean> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
            relations: ['users_like'],
        });
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!article || !user) return false;
        const exists = (article.users_like ?? []).some((u) => u.id === user.id);
        if (!exists) {
            article.users_like = [...(article.users_like ?? []), user];
            article.count_likes = (article.count_likes ?? 0) + 1;
            await this.articleRepository.save(article);
            return true;
        }
        return true;
    }

    async unlike(articleId: number, userId: number): Promise<boolean> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
            relations: ['users_like'],
        });
        if (!article || !article.users_like) return false;
        const before = article.users_like.length;
        article.users_like = article.users_like.filter((u) => u.id !== userId);
        if (article.users_like.length !== before) {
            article.count_likes = Math.max(0, (article.count_likes ?? 0) - 1);
            await this.articleRepository.save(article);
            return true;
        }
        return false;
    }

    async addImages(
        articleId: number,
        images: ArticleImageDTO[],
    ): Promise<ArticleImageDetailDTO[]> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
        });
        if (!article) return [];
        const entities = images.map((i) =>
            this.imageRepository.create({ image_url: i.image_url, article }),
        );
        const saved = await this.imageRepository.save(entities);
        return saved.map(
            (s) =>
                new ArticleImageDetailDTO({ id: s.id, image_url: s.image_url }),
        );
    }

    async removeImage(imageId: number): Promise<boolean> {
        const res = await this.imageRepository.delete({ id: imageId });
        return (res.affected ?? 0) > 0;
    }

    async incrementView(id: number): Promise<boolean> {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) return false;
        article.count_views = (article.count_views ?? 0) + 1;
        await this.articleRepository.save(article);
        return true;
    }

    async toggleVisible(id: number, visible: boolean): Promise<boolean> {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) return false;
        article.is_visible = visible;
        await this.articleRepository.save(article);
        return true;
    }
}

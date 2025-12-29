import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ArticleCommentDetailDTO, ArticleDetailDTO } from '../dto/article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from '../../tour/entity/tour.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { Repository, In } from 'typeorm';
import { NotificationService } from '../../user/service/notification.service';
import { NotificationType } from '../../user/dtos/notification.dto';

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
    user_id?: string | number;
    tour_id?: string | number;
    tags?: string[];
    users_like?: string[];
    users_bookmark?: string[];
    is_visible?: boolean;
    updated_at?: string;
    deleted_at?: string;
    comments?: ArticleCommentDetailDTO[];
}

@Injectable()
export class ArticleServiceProxy {
    constructor(
        @Inject('ARTICLE_SERVICE') private readonly client: ClientProxy,
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
    ) {}

    async getArticleBySlug(slug: string): Promise<ArticleResponse> {
        return lastValueFrom(this.client.send('getArticleBySlug', slug));
    }

    async getArticleById(id: string): Promise<any> {
        return lastValueFrom(this.client.send('get_article_by_id', id));
    }

    async createArticle(userUuid: string, dto: ArticleDetailDTO): Promise<any> {
        const article = {
            title: dto.title,
            content: dto.content,
            user_id: userUuid,
            count_likes: 0,
            count_views: 0,
            count_comments: 0,
            tour_id: dto.tour_id ?? undefined,
            comments: [],
            users_like: [],
            tags: dto.tags || [],
            images: dto.images || [],
            is_visible: true,
        };
        console.log(
            'Creating article with user_id (UUID):',
            userUuid,
            'Article:',
            JSON.stringify(article),
        );
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
        await lastValueFrom(
            this.client.send('add_comment', {
                article_id: articleId,
                user_id: userId,
                content,
            }),
        );

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const article = await this.getArticleById(articleId);
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (article && article.user_id && article.user_id !== userId) {
                await this.notificationService.create({
                    title: user?.full_name || 'Someone',
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    description: `commented on your article: ${article.title}`,
                    type: NotificationType.comment,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    user_ids: [article.user_id as number],
                    is_user: true,
                });
            }
        } catch (error) {
            console.error('Failed to send comment notification:', error);
        }
    }

    async likeArticle(id: string, userId: string): Promise<void> {
        console.log('[likeArticle] Sending to microservice:', {
            articleId: id,
            userId,
        });
        await lastValueFrom(
            this.client.send('like_article', { articleId: id, userId }),
        );
        console.log('[likeArticle] Microservice response received');

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const article = await this.getArticleById(id);
            const user = await this.userRepository.findOne({
                where: { uuid: userId },
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (article && article.user_id && article.user_id !== userId) {
                await this.notificationService.create({
                    title: user?.full_name || 'Someone',
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    description: `liked your article: ${article.title}`,
                    type: NotificationType.like,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    user_ids: [article.user_id as number],
                    is_user: true,
                });
            }
        } catch (error) {
            console.error('Failed to send like notification:', error);
        }
    }

    async unlikeArticle(
        articleId: number | string,
        userId: string,
    ): Promise<void> {
        return lastValueFrom(
            this.client.send('unlike_article', { articleId, userId }),
        );
    }

    async bookmarkArticle(articleId: string, userId: string): Promise<void> {
        await lastValueFrom(
            this.client.send('bookmark_article', { articleId, userId }),
        );
    }

    async unbookmarkArticle(articleId: string, userId: string): Promise<void> {
        await lastValueFrom(
            this.client.send('unbookmark_article', { articleId, userId }),
        );
    }

    async getPopularArticles(
        limit: number,
        page: number = 1,
    ): Promise<ArticleResponse[]> {
        const response: ArticleResponse[] = await lastValueFrom(
            this.client.send('get_popular_articles', { limit, page }),
        );
        console.log(
            '[getPopularArticles proxy] Raw response users_like:',
            response[0]?.users_like,
        );
        const mapped = await this.mapArticlesWithTourInfo(response);
        console.log(
            '[getPopularArticles proxy] Mapped response users_like:',
            mapped[0]?.users_like,
        );
        return mapped;
    }

    async getArticlesByTag(
        tag: string,
        limit: number,
        page: number = 1,
    ): Promise<ArticleResponse[]> {
        return lastValueFrom(
            this.client.send('get_articles_by_tag', { tag, limit, page }),
        );
    }

    async getArticlesByUser(userId: string): Promise<ArticleResponse[]> {
        return lastValueFrom(this.client.send('get_articles_by_user', userId));
    }

    async getArticlesLikedByUser(userId: string): Promise<ArticleResponse[]> {
        return lastValueFrom(
            this.client.send('get_articles_liked_by_user', userId),
        );
    }

    async getTrendingTags(
        limit: number,
    ): Promise<{ _id: string; count: number }[]> {
        return lastValueFrom(this.client.send('get_trending_tags', limit));
    }

    async follow(followerId: number, followingId: number) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return lastValueFrom(
            this.client.send('follow_user', { followerId, followingId }),
        );
    }

    async unfollow(followerId: number, followingId: number) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return lastValueFrom(
            this.client.send('unfollow_user', { followerId, followingId }),
        );
    }

    async getFollowedIds(followerId: number): Promise<number[]> {
        return lastValueFrom(this.client.send('get_following_ids', followerId));
    }

    async getFollowerIds(followingId: number): Promise<number[]> {
        return lastValueFrom(this.client.send('get_follower_ids', followingId));
    }

    async getFollowingArticles(
        userId: number,
        limit: number,
        page: number = 1,
    ): Promise<ArticleResponse[]> {
        const followingIds = await this.getFollowedIds(userId);
        if (followingIds.length === 0) return [];

        const response: ArticleResponse[] = await lastValueFrom(
            this.client.send('get_following_articles', {
                userIds: followingIds,
                limit,
                page,
            }),
        );
        return this.mapArticlesWithTourInfo(response);
    }

    private async mapArticlesWithTourInfo(
        articles: ArticleResponse[],
    ): Promise<ArticleResponse[]> {
        const tourIds = articles
            .map((a) => a.tour_id)
            .filter((id): id is string | number => !!id)
            .map((id) => Number(id));
        const tours =
            tourIds.length > 0
                ? await this.tourRepository.find({
                      where: { id: In(tourIds) },
                      select: ['id', 'title', 'slug'],
                  })
                : [];

        const tourMap = new Map(tours.map((t) => [t.id, t]));

        return articles.map(
            (article): ArticleResponse =>
                ({
                    _id: article?._id,
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

                    tour: tourMap.get(Number(article.tour_id)) as unknown,
                    user_id: article?.user_id,
                    users_like: article?.users_like || [],
                    users_bookmark: article?.users_bookmark || [],
                    is_visible: article?.is_visible,
                    comments:
                        article?.comments?.map(
                            (comment: ArticleCommentDetailDTO) => ({
                                id: comment.id,
                                content: comment.content,
                                parent_id: comment.parent_id,
                                user_id: comment.user_id,
                                created_at: comment.created_at,
                                updated_at: comment.updated_at,
                            }),
                        ) || [],
                    created_at: article?.created_at,
                    updated_at: article?.updated_at,
                    deleted_at: article?.deleted_at,
                }) as ArticleResponse,
        );
    }

    async getBookmarkedArticles(
        userId: string,
        limit: number = 10,
        page: number = 1,
    ): Promise<ArticleResponse[]> {
        const response: ArticleResponse[] = await lastValueFrom(
            this.client.send('get_bookmarked_articles', {
                userId,
                limit,
                page,
            }),
        );
        return this.mapArticlesWithTourInfo(response);
    }
}

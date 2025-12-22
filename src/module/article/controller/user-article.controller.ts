import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Post } from '@nestjs/common';
import { UserArticlePopularDTO } from '../dto/article.dto';
import { ArticleServiceProxy } from '../service/article.service-proxy';

@ApiTags('User Article')
@Controller('user/article')
export class UserArticleController {
    constructor(private readonly articleServiceProxy: ArticleServiceProxy) {}

    @Get('popular')
    @ApiOperation({ summary: 'Get popular articles' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Popular articles retrieved successfully',
        type: [UserArticlePopularDTO],
    })
    async getPopularArticles(
        @Query('limit') limit?: number,
    ): Promise<UserArticlePopularDTO[]> {
        const limitNum = limit ? Number(limit) : 6;
        const articles = await this.articleServiceProxy.getPopularArticles();
        return articles.slice(0, limitNum).map(
            (article): UserArticlePopularDTO => ({
                id: article._id,
                title: article.title,
                description: article.content
                    ? article.content.substring(0, 150).replace(/<[^>]*>/g, '')
                    : '',
                image:
                    article.images && article.images.length > 0
                        ? article.images[0].image_url
                        : '/assets/images/default-article.jpg',
                user: {
                    name: article.user?.name || 'Anonymous',
                    avatar: article.user?.avatar || '',
                },
                timestamp: article.created_at,
                views: article.count_views,
                likes: article.count_likes,
                comments: article.count_comments,
                tags: [], // Optional in DTO but might be needed if not present in article
                images:
                    article.images?.map(
                        (img: { image_url: string }) => img.image_url,
                    ) || [],
            }),
        );
    }

    @Post()
    @ApiOperation({ summary: 'Create article' })
    @ApiResponse({ status: 201, description: 'Article created successfully' })
    async createArticle(): Promise<void> {
        return Promise.resolve();
    }
}

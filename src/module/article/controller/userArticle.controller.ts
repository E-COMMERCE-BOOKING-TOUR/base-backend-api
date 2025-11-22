import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { UserArticleService } from '../service/userArticle.service';
import { UserArticlePopularDTO, ArticleDTO } from '../dto/article.dto';
import { ArticleServiceProxy } from '../service/article.service-proxy';
import { User } from 'src/module/user/decorator/user.decorator';
import { UserEntity } from 'src/module/user/entity/user.entity';
// import { JwtAuthGuard } from 'src/module/user/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Article')
@Controller('user/article')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class UserArticleController {
    constructor(private readonly articleServiceProxy: ArticleServiceProxy) { }
    @Get('popular')
    @ApiOperation({ summary: 'Get popular articles' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of articles to return',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'List of popular articles',
        type: [UserArticlePopularDTO],
    })
    async getPopularArticles(
        @Query('limit') limit?: string,
    ): Promise<UserArticlePopularDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const articles = await this.articleServiceProxy.getPopularArticles(limitNum);
        return articles.map((article: any) => ({
            id: article._id,
            title: article.title,
            description: article.content ? article.content.substring(0, 100) + '...' : '',
            image: article.images?.[0]?.image_url || '',
            images: article.images?.map((img: any) => img.image_url) || [],
            tags: [],
            timestamp: article.created_at,
            views: article.count_views,
            likes: article.count_likes,
            comments: article.count_comments,
            user: article.user || { name: 'Unknown', avatar: '' },
        }));
    }
    @Post('create')
    @ApiOperation({ summary: 'Create article' })
    @ApiResponse({ status: 201, description: 'Article created successfully' })
    async createArticle(
        @User() user: UserEntity,
        @Body() dto: ArticleDTO,
    ) {
        return;
        // return this.articleServiceProxy.createArticle({
        //     ...dto,
        //     user_id: user.id,
        //     user: {
        //         name: user.name,
        //         avatar: user.avatar,
        //     }
        // });
    }
}

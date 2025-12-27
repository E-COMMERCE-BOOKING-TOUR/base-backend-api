import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ArticleDetailDTO, ArticleDTO } from '../dto/article.dto';
import { ArticleServiceProxy } from '../service/article.service-proxy';
import { User } from 'src/module/user/decorator/user.decorator';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
// import { JwtAuthGuard } from 'src/module/user/guard/jwt.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Article')
@Controller('user/article')
export class UserArticleController {
    constructor(private readonly articleServiceProxy: ArticleServiceProxy) { }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular articles' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'List of popular articles',
    })
    async getPopularArticles(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.articleServiceProxy.getPopularArticles(limitNum);
    }

    @Get('tag/:tag')
    @ApiOperation({ summary: 'Get articles by tag' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'List of articles by tag',
    })
    async getArticlesByTag(@Param('tag') tag: string, @Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.articleServiceProxy.getArticlesByTag(tag, limitNum);
    }

    @Get('mine')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get my articles' })
    async getMyArticles(@User() user: UserEntity) {
        return await this.articleServiceProxy.getArticlesByUser(user.id);
    }

    @Get('trending-tags')
    @ApiOperation({ summary: 'Get trending tags' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getTrendingTags(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 4;
        return await this.articleServiceProxy.getTrendingTags(limitNum);
    }

    @Get('liked')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get articles liked by me' })
    async getLikedArticles(@User() user: UserEntity) {
        return await this.articleServiceProxy.getArticlesLikedByUser(user.id);
    }

    @Get('list')
    @ApiOperation({ summary: 'Get list articles' })
    async getListArticles() {
        return this.articleServiceProxy.getAllArticles();
    }

    @Post('create')
    @ApiOperation({ summary: 'Create article' })
    @ApiResponse({ status: 201, description: 'Article created successfully' })
    async createArticle(
        @User() user: UserEntity,
        @Body() dto: ArticleDetailDTO,
    ) {
        return this.articleServiceProxy.createArticle(user.id, dto);
    }

    @Post('update/:id')
    @ApiOperation({ summary: 'Update article' })
    @ApiResponse({ status: 200, description: 'Article updated successfully' })
    async updateArticle(
        @User() user: UserEntity,
        @Param('id') id: string,
        @Body() dto: ArticleDTO,
    ) {
        return this.articleServiceProxy.updateArticle(id, user.id, dto);
    }

    @Post('delete/:id')
    @ApiOperation({ summary: 'Delete article' })
    @ApiResponse({ status: 200, description: 'Article deleted successfully' })
    async deleteArticle(@Param('id') id: string) {
        return this.articleServiceProxy.removeArticle(id);
    }

    @Post('like/:id')
    @ApiOperation({ summary: 'Like article' })
    @ApiResponse({ status: 200, description: 'Article liked successfully' })
    async likeArticle(@User() user: UserEntity, @Param('id') id: string) {
        return this.articleServiceProxy.likeArticle(id, user.id);
    }

    @Post('unlike/:id')
    @ApiOperation({ summary: 'Unlike article' })
    @ApiResponse({ status: 200, description: 'Article unliked successfully' })
    async unlikeArticle(@User() user: UserEntity, @Param('id') id: string) {
        return this.articleServiceProxy.unlikeArticle(id, user.id);
    }
    @Post('comment')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Add comment to article' })
    @ApiResponse({ status: 201, description: 'Comment added successfully' })
    async addComment(
        @User() user: UserEntity,
        @Body() body: { articleId: string; content: string },
    ) {
        return this.articleServiceProxy.addComment(
            body.articleId,
            user.id,
            body.content,
        );
    }
}

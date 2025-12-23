import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { ArticleDetailDTO, ArticleDTO } from '../dto/article.dto';
import { ArticleServiceProxy } from '../service/article.service-proxy';
import { User } from 'src/module/user/decorator/user.decorator';
import { UserEntity } from 'src/module/user/entity/user.entity';
// import { JwtAuthGuard } from 'src/module/user/guard/jwt.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';

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
    })
    async getPopularArticles(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.articleServiceProxy.getPopularArticles(limitNum);
    }

    @Get('list')
    @ApiOperation({ summary: 'Get list articles' })
    async getListArticles() {
        return this.articleServiceProxy.getAllArticles();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get article detail' })
    async getArticle(@Param('id') id: string) {
        return this.articleServiceProxy.getArticleById(id);
    }

    @Post('create/:user_uuid')
    @ApiOperation({ summary: 'Create article' })
    @ApiResponse({ status: 201, description: 'Article created successfully' })
    async createArticle(
        @Param('user_uuid') user_uuid: string,
        @Body() dto: ArticleDetailDTO,
    ) {
        return this.articleServiceProxy.createArticle(user_uuid, dto);
    }

    @Post('update/:id')
    @ApiOperation({ summary: 'Update article' })
    @ApiResponse({ status: 200, description: 'Article updated successfully' })
    async updateArticle(
        @User() user: UserEntity,
        @Param('id') id: string,
        @Body() dto: ArticleDTO,
    ) {
        return this.articleServiceProxy.updateArticle(id, dto);
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
}

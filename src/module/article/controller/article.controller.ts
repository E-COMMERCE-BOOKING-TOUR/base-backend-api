import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleService } from '../service/article.service';
import {
    ArticleDTO,
    ArticleImageDTO,
    ArticleDetailDTO,
    ArticleSummaryDTO,
    ArticleCommentDetailDTO,
    ArticleImageDetailDTO,
} from '../dto/article.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [ArticleDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllArticles() {
        return await this.articleService.getAllArticles();
    }

    @Post('getAllByUser/:userId')
    @ApiResponse({ status: 201, type: [ArticleSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async getArticlesByUser(@Param('userId') userId: number) {
        return await this.articleService.getArticlesByUser(userId);
    }

    @Post('getById/:id')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async getArticleById(@Param('id') id: number) {
        return await this.articleService.getArticleById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: ArticleDTO })
    async create(@Body() dto: ArticleDTO) {
        return await this.articleService.create(dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: ArticleDTO })
    async update(
        @Param('id') id: number,
        @Body() payload: Partial<ArticleDTO>,
    ) {
        return await this.articleService.update(id, payload);
    }

    @Delete('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async remove(@Param('id') id: number) {
        return await this.articleService.remove(id);
    }

    @Post('addComment/:articleId')
    @ApiResponse({ status: 201, type: ArticleCommentDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    @ApiBody({ type: ArticleCommentDetailDTO })
    async addComment(
        @Param('articleId') articleId: number,
        @Body()
        payload: {
            userId: number;
            content: string;
            parentId?: number;
        },
    ) {
        return await this.articleService.addComment(
            articleId,
            payload.userId,
            payload.content,
            payload.parentId,
        );
    }

    @Delete('removeComment/:commentId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'commentId', type: Number, example: 1 })
    async removeComment(@Param('commentId') commentId: number) {
        return await this.articleService.removeComment(commentId);
    }

    @Post('like/:articleId/:userId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async like(
        @Param('articleId') articleId: number,
        @Param('userId') userId: number,
    ) {
        return await this.articleService.like(articleId, userId);
    }

    @Post('unlike/:articleId/:userId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    @ApiParam({ name: 'userId', type: Number, example: 1 })
    async unlike(
        @Param('articleId') articleId: number,
        @Param('userId') userId: number,
    ) {
        return await this.articleService.unlike(articleId, userId);
    }

    @Post('addImages/:articleId')
    @ApiResponse({ status: 201, type: [ArticleImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    async addImages(
        @Param('articleId') articleId: number,
        @Body() payload: { images: ArticleImageDTO[] },
    ) {
        return await this.articleService.addImages(articleId, payload.images);
    }

    @Post('removeImage/:imageId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'imageId', type: Number, example: 1 })
    async removeImage(@Param('imageId') imageId: number) {
        return await this.articleService.removeImage(imageId);
    }

    @Post('incrementView/:articleId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    async incrementView(@Param('articleId') articleId: number) {
        return await this.articleService.incrementView(articleId);
    }

    @Post('toggleVisible/:articleId')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'articleId', type: Number, example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { visible: { type: 'boolean', example: true } },
            required: ['visible'],
        },
    })
    async toggleVisible(
        @Param('articleId') articleId: number,
        @Body('visible') visible: boolean,
    ) {
        return await this.articleService.toggleVisible(articleId, visible);
    }
}

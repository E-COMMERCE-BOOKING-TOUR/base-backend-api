import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleService } from '../service/article.service';
import { ArticleDTO, ArticleImageDTO, ArticleDetailDTO, ArticleSummaryDTO, ArticleCommentDetailDTO, ArticleImageDetailDTO } from '../dto/article.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [ArticleSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAllArticles() {
        return await this.articleService.getAllArticles();
    }

    @Post('getAllByUser')
    @ApiResponse({ status: 201, type: [ArticleSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getArticlesByUser(@Body() userId: number) {
        return await this.articleService.getArticlesByUser(userId);
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getArticleById(@Body() id: number) {
        return await this.articleService.getArticleById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(@Body() dto: ArticleDTO) {
        return await this.articleService.create(dto);
    }

    @Post('update')
    @ApiResponse({ status: 201, type: ArticleDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async update(@Body() payload: { id: number; data: Partial<ArticleDTO> }) {
        return await this.articleService.update(payload.id, payload.data);
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Body() id: number) {
        return await this.articleService.remove(id);
    }

    @Post('addComment')
    @ApiResponse({ status: 201, type: ArticleCommentDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addComment(
        @Body()
        payload: {
            articleId: number;
            userId: number;
            content: string;
            parentId?: number;
        },
    ) {
        return await this.articleService.addComment(
            payload.articleId,
            payload.userId,
            payload.content,
            payload.parentId,
        );
    }

    @Post('removeComment')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeComment(@Body() commentId: number) {
        return await this.articleService.removeComment(commentId);
    }

    @Post('like')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async like(@Body() payload: { articleId: number; userId: number }) {
        return await this.articleService.like(
            payload.articleId,
            payload.userId,
        );
    }

    @Post('unlike')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async unlike(@Body() payload: { articleId: number; userId: number }) {
        return await this.articleService.unlike(
            payload.articleId,
            payload.userId,
        );
    }

    @Post('addImages')
    @ApiResponse({ status: 201, type: [ArticleImageDetailDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async addImages(
        @Body() payload: { articleId: number; images: ArticleImageDTO[] },
    ) {
        return await this.articleService.addImages(
            payload.articleId,
            payload.images,
        );
    }

    @Post('removeImage')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async removeImage(@Body() imageId: number) {
        return await this.articleService.removeImage(imageId);
    }

    @Post('incrementView')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async incrementView(@Body() id: number) {
        return await this.articleService.incrementView(id);
    }

    @Post('toggleVisible')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async toggleVisible(@Body() payload: { id: number; visible: boolean }) {
        return await this.articleService.toggleVisible(
            payload.id,
            payload.visible,
        );
    }
}

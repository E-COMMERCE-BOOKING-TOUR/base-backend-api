import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleService } from '../service/article.service';
import { ArticleDTO, ArticleImageDTO } from '../dto/article.dto';

@ApiTags('artivle')
@Controller('article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get('getAll')
    async getAllArticles() {
        return await this.articleService.getAllArticles();
    }

    @Post('getAllByUser')
    async getArticlesByUser(@Body() userId: number) {
        return await this.articleService.getArticlesByUser(userId);
    }

    @Post('getById')
    async getArticleById(@Body() id: number) {
        return await this.articleService.getArticleById(id);
    }

    @Post('create')
    async create(@Body() dto: ArticleDTO) {
        return await this.articleService.create(dto);
    }

    @Post('update')
    async update(@Body() payload: { id: number; data: Partial<ArticleDTO> }) {
        return await this.articleService.update(payload.id, payload.data);
    }

    @Post('remove')
    async remove(@Body() id: number) {
        return await this.articleService.remove(id);
    }

    @Post('addComment')
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
    async removeComment(@Body() commentId: number) {
        return await this.articleService.removeComment(commentId);
    }

    @Post('like')
    async like(@Body() payload: { articleId: number; userId: number }) {
        return await this.articleService.like(
            payload.articleId,
            payload.userId,
        );
    }

    @Post('unlike')
    async unlike(@Body() payload: { articleId: number; userId: number }) {
        return await this.articleService.unlike(
            payload.articleId,
            payload.userId,
        );
    }

    @Post('addImages')
    async addImages(
        @Body() payload: { articleId: number; images: ArticleImageDTO[] },
    ) {
        return await this.articleService.addImages(
            payload.articleId,
            payload.images,
        );
    }

    @Post('removeImage')
    async removeImage(@Body() imageId: number) {
        return await this.articleService.removeImage(imageId);
    }

    @Post('incrementView')
    async incrementView(@Body() id: number) {
        return await this.articleService.incrementView(id);
    }

    @Post('toggleVisible')
    async toggleVisible(@Body() payload: { id: number; visible: boolean }) {
        return await this.articleService.toggleVisible(
            payload.id,
            payload.visible,
        );
    }
}

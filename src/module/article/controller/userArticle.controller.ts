import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query } from "@nestjs/common";
import { UserArticleService } from "../service/userArticle.service";
import { UserArticlePopularDTO } from "../dto/article.dto";

@ApiTags('User Article')
@Controller('user/article')
export class UserArticleController {
    constructor(private readonly userArticleService: UserArticleService) {}

    @Get('popular')
    @ApiOperation({ summary: 'Get popular articles' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of articles to return', example: 10 })
    @ApiResponse({
        status: 200,
        description: 'List of popular articles',
        type: [UserArticlePopularDTO],
    })
    async getPopularArticles(@Query('limit') limit?: string): Promise<UserArticlePopularDTO[]> {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.userArticleService.getPopularArticles(limitNum);
    }
}
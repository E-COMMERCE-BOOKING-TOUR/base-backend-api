import {
    Controller,
    Get,
    Delete,
    Patch,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../user/guard/roles.guard';
import { Permissions } from '../../user/decorator/permissions.decorator';
import { PermissionsGuard } from '../../user/guard/permissions.guard';
import { AdminArticleServiceProxy } from '../service/admin-article.service-proxy';

@ApiTags('Admin Social')
@Controller('admin/social')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class AdminArticleController {
    constructor(
        private readonly adminArticleServiceProxy: AdminArticleServiceProxy,
    ) { }

    @Get('articles')
    @Permissions('article:read')
    @ApiOperation({ summary: 'Get all articles' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'is_visible', required: false, type: Boolean })
    getArticles(
        @Query('limit') limit?: number,
        @Query('page') page?: number,
        @Query('search') search?: string,
        @Query('is_visible') is_visible?: boolean,
    ) {
        return this.adminArticleServiceProxy.getArticles(limit, page, {
            search,
            is_visible,
        });
    }

    @Delete('articles/:id')
    @Permissions('article:delete')
    @ApiOperation({ summary: 'Delete article' })
    deleteArticle(@Param('id') id: string) {
        return this.adminArticleServiceProxy.deleteArticle(id);
    }

    @Patch('articles/:id/visibility')
    @Permissions('article:update')
    @ApiOperation({ summary: 'Toggle article visibility' })
    toggleVisibility(@Param('id') id: string) {
        return this.adminArticleServiceProxy.toggleVisibility(id);
    }

    @Get('stats')
    @Permissions('article:read')
    @ApiOperation({ summary: 'Get social statistics' })
    getStats() {
        return this.adminArticleServiceProxy.getStats();
    }
}

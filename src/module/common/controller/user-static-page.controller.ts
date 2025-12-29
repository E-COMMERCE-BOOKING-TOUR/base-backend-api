import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminStaticPageService } from '../service/admin-static-page.service';

@ApiTags('Settings')
@Controller('settings/pages')
export class UserStaticPageController {
    constructor(
        private readonly adminStaticPageService: AdminStaticPageService,
    ) {}

    @Get(':slug')
    @ApiOperation({ summary: 'Lấy nội dung trang tĩnh theo slug' })
    async findBySlug(@Param('slug') slug: string) {
        return this.adminStaticPageService.findBySlug(slug);
    }
}

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminStaticPageService } from '../service/admin-static-page.service';
import {
    CreateStaticPageDTO,
    UpdateStaticPageDTO,
} from '../dto/static-page.dto';

@ApiTags('Admin - Static Pages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/static-pages')
export class AdminStaticPageController {
    constructor(
        private readonly adminStaticPageService: AdminStaticPageService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả các trang tĩnh' })
    async findAll() {
        return this.adminStaticPageService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết một trang tĩnh theo ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.adminStaticPageService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới một trang tĩnh' })
    async create(@Body() dto: CreateStaticPageDTO) {
        return this.adminStaticPageService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật một trang tĩnh' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStaticPageDTO,
    ) {
        return this.adminStaticPageService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa một trang tĩnh' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.adminStaticPageService.remove(id);
    }
}

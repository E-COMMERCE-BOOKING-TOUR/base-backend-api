import {
    Controller,
    UseGuards,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { AdminPermissionService } from '../service/admin-permission.service';
import { CreatePermissionDTO } from '../dtos/admin/create-permission.dto';
import { UpdatePermissionDTO } from '../dtos/admin/update-permission.dto';

@ApiTags('Admin Permission')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/permission')
export class AdminPermissionController {
    constructor(
        private readonly adminPermissionService: AdminPermissionService,
    ) {}

    @Get('getAll')
    @ApiOperation({ summary: 'Lấy danh sách tất cả quyền' })
    async getAll() {
        return this.adminPermissionService.getAll();
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Lấy thông tin quyền theo ID' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminPermissionService.getById(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Tạo quyền mới' })
    async create(@Body() dto: CreatePermissionDTO) {
        return this.adminPermissionService.create(dto);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Cập nhật thông tin quyền' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePermissionDTO,
    ) {
        return this.adminPermissionService.update(id, dto);
    }

    @Delete('remove/:id')
    @ApiOperation({ summary: 'Xóa quyền' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        const success = await this.adminPermissionService.remove(id);
        return { success };
    }
}

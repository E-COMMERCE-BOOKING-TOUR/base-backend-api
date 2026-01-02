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
    Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { Permissions } from '../decorator/permissions.decorator';
import { PermissionsGuard } from '../guard/permissions.guard';
import { AdminRoleService } from '../service/admin-role.service';
import { CreateRoleDTO } from '../dtos/admin/create-role.dto';
import { UpdateRoleDTO } from '../dtos/admin/update-role.dto';

@ApiTags('Admin Role')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('admin/role')
export class AdminRoleController {
    constructor(private readonly adminRoleService: AdminRoleService) { }

    @Get('getAll')
    @Permissions('role:read')
    @ApiOperation({ summary: 'Lấy danh sách tất cả vai trò' })
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminRoleService.getAll(Number(page), Number(limit));
    }

    @Get('getById/:id')
    @Permissions('role:read')
    @ApiOperation({ summary: 'Lấy thông tin vai trò theo ID' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminRoleService.getById(id);
    }

    @Post('create')
    @Permissions('role:create')
    @ApiOperation({ summary: 'Tạo vai trò mới' })
    async create(@Body() dto: CreateRoleDTO) {
        return this.adminRoleService.create(dto);
    }

    @Put('update/:id')
    @Permissions('role:update')
    @ApiOperation({ summary: 'Cập nhật thông tin vai trò' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDTO,
    ) {
        return this.adminRoleService.update(id, dto);
    }

    @Delete('remove/:id')
    @Permissions('role:delete')
    @ApiOperation({ summary: 'Xóa vai trò' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        const success = await this.adminRoleService.remove(id);
        return { success };
    }
}

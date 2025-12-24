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
import { UserService } from '../service/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CreateUserAdminDTO } from '../dtos/admin/create-user-admin.dto';
import { UpdateUserAdminDTO } from '../dtos/admin/update-user-admin.dto';
import { hashPassword } from '@/utils/bcrypt.util';

@ApiTags('Admin User')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/user')
export class AdminUserController {
    constructor(private readonly userService: UserService) {}

    @Get('getAll')
    @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('role_id') role_id?: number,
        @Query('supplier_id') supplier_id?: number,
        @Query('status') status?: number,
    ) {
        return this.userService.getAllUsers(
            Number(page),
            Number(limit),
            search,
            role_id ? Number(role_id) : undefined,
            supplier_id ? Number(supplier_id) : undefined,
            status ? Number(status) : undefined,
        );
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserById(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Tạo người dùng mới' })
    async create(@Body() dto: CreateUserAdminDTO) {
        // Hash password before creating user
        const hashedPassword = await hashPassword(dto.password);
        const { randomUUID } = await import('crypto');
        return this.userService.createUser({
            ...dto,
            password: hashedPassword,
            uuid: randomUUID(),
        });
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserAdminDTO,
    ) {
        // Hash password if provided
        if (dto.password) {
            const hashedPassword = await hashPassword(dto.password);
            dto.password = hashedPassword;
        }
        return this.userService.updateUser(id, dto);
    }

    @Delete('remove/:id')
    @ApiOperation({ summary: 'Xóa người dùng' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        const success = await this.userService.removeUser(id);
        return { success };
    }
}

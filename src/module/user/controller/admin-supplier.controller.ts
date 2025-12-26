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
import { AdminSupplierService } from '../service/admin-supplier.service';
import { CreateSupplierDTO } from '../dtos/admin/create-supplier.dto';
import { UpdateSupplierDTO } from '../dtos/admin/update-supplier.dto';

@ApiTags('Admin Supplier')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/supplier')
export class AdminSupplierController {
    constructor(private readonly adminSupplierService: AdminSupplierService) {}

    @Get('getAll')
    @ApiOperation({ summary: 'Lấy danh sách tất cả nhà cung cấp' })
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminSupplierService.getAll(Number(page), Number(limit));
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Lấy thông tin nhà cung cấp theo ID' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminSupplierService.getById(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
    async create(@Body() dto: CreateSupplierDTO) {
        return this.adminSupplierService.create(dto);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSupplierDTO,
    ) {
        return this.adminSupplierService.update(id, dto);
    }

    @Delete('remove/:id')
    @ApiOperation({ summary: 'Xóa nhà cung cấp' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        const success = await this.adminSupplierService.remove(id);
        return { success };
    }
}

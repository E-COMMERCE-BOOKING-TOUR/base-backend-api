import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminCurrencyService } from '../service/admin-currency.service';
import {
    CreateCurrencyDTO,
    UpdateCurrencyDTO,
} from '../dto/admin-currency.dto';

@ApiTags('Admin - Currency')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/currency')
export class AdminCurrencyController {
    constructor(private readonly adminCurrencyService: AdminCurrencyService) {}

    @Get('getAll')
    @ApiOperation({ summary: 'Lấy danh sách tất cả currency' })
    async getAll() {
        return this.adminCurrencyService.getAll();
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Lấy chi tiết currency' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminCurrencyService.getById(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Tạo currency mới' })
    async create(@Body() dto: CreateCurrencyDTO) {
        return this.adminCurrencyService.create(dto);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Cập nhật currency' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCurrencyDTO,
    ) {
        return this.adminCurrencyService.update(id, dto);
    }

    @Delete('remove/:id')
    @ApiOperation({ summary: 'Xóa currency' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.adminCurrencyService.remove(id);
        return { message: 'Xóa currency thành công' };
    }
}

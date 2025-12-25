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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDivisionService } from '../service/admin-division.service';
import { CreateDivisionDTO, UpdateDivisionDTO } from '../dto/admin-division.dto';
import { CloudinaryService } from '@/module/cloudinary/cloudinary.service';

@ApiTags('Admin - Division')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/division')
export class AdminDivisionController {
    constructor(
        private readonly adminDivisionService: AdminDivisionService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Get('getAll')
    @ApiOperation({ summary: 'Lấy danh sách tất cả division' })
    async getAll() {
        return this.adminDivisionService.getAll();
    }

    @Get('getByCountry/:countryId')
    @ApiOperation({ summary: 'Lấy danh sách division theo country' })
    async getByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
        return this.adminDivisionService.getByCountry(countryId);
    }

    @Get('countries')
    @ApiOperation({ summary: 'Lấy danh sách countries' })
    async getCountries() {
        return this.adminDivisionService.getCountries();
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Lấy chi tiết division' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminDivisionService.getById(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Tạo division mới' })
    async create(@Body() dto: CreateDivisionDTO) {
        return this.adminDivisionService.create(dto);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Cập nhật division' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDivisionDTO,
    ) {
        return this.adminDivisionService.update(id, dto);
    }

    @Delete('remove/:id')
    @ApiOperation({ summary: 'Xóa division' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.adminDivisionService.remove(id);
        return { message: 'Xóa division thành công' };
    }

    @Post(':id/upload-image')
    @ApiOperation({ summary: 'Upload hình ảnh cho division' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const result = await this.cloudinaryService.uploadFile(file);
        await this.adminDivisionService.update(id, { image_url: result.secure_url });
        return { image_url: result.secure_url };
    }
}

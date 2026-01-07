import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDivisionService, DivisionQueryDTO } from '../service/admin-division.service';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { PermissionsGuard } from '@/module/user/guard/permissions.guard';
import { Permissions } from '@/module/user/decorator/permissions.decorator';
import { Roles } from '@/module/user/decorator/roles.decorator';
import {
    CreateDivisionDTO,
    UpdateDivisionDTO,
} from '../dto/admin-division.dto';
import { CloudinaryService } from '@/module/cloudinary/cloudinary.service';
import { CloudinaryResponse } from '@/module/cloudinary/cloudinary-response';

@ApiTags('Admin - Division')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('admin/division')
export class AdminDivisionController {
    constructor(
        private readonly adminDivisionService: AdminDivisionService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Get('getAll')
    @Permissions('division:read')
    @ApiOperation({ summary: 'Lấy danh sách tất cả division với phân trang' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @ApiQuery({ name: 'country_id', required: false, type: Number })
    @ApiQuery({ name: 'parent_id', required: false, type: Number, description: 'Filter by parent. Use 0 for root divisions.' })
    async getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('keyword') keyword?: string,
        @Query('country_id') country_id?: string,
        @Query('parent_id') parent_id?: string,
    ) {
        const query: DivisionQueryDTO = {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            keyword,
            country_id: country_id ? parseInt(country_id, 10) : undefined,
            parent_id: parent_id !== undefined ? (parent_id === '0' ? null : parseInt(parent_id, 10)) : undefined,
        };
        return this.adminDivisionService.getAll(query);
    }

    @Get('getByCountry/:countryId')
    @Permissions('division:read')
    @ApiOperation({ summary: 'Lấy danh sách division theo country' })
    async getByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
        return this.adminDivisionService.getByCountry(countryId);
    }

    @Get('countries')
    @Permissions('division:read')
    @ApiOperation({ summary: 'Lấy danh sách countries' })
    async getCountries() {
        return this.adminDivisionService.getCountries();
    }

    @Get('getById/:id')
    @Permissions('division:read')
    @ApiOperation({ summary: 'Lấy chi tiết division' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.adminDivisionService.getById(id);
    }

    @Post('create')
    @Permissions('division:create')
    @ApiOperation({ summary: 'Tạo division mới' })
    async create(@Body() dto: CreateDivisionDTO) {
        return this.adminDivisionService.create(dto);
    }

    @Put('update/:id')
    @Permissions('division:update')
    @ApiOperation({ summary: 'Cập nhật division' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDivisionDTO,
    ) {
        return this.adminDivisionService.update(id, dto);
    }

    @Delete('remove/:id')
    @Permissions('division:delete')
    @ApiOperation({ summary: 'Xóa division' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.adminDivisionService.remove(id);
        return { message: 'Xóa division thành công' };
    }

    @Post('upload')
    @Permissions('division:create', 'division:update')
    @ApiOperation({ summary: 'Upload generic image for division' })
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
    async upload(@UploadedFile() file: Express.Multer.File) {
        const result: CloudinaryResponse =
            await this.cloudinaryService.uploadFile(file);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { image_url: result.secure_url };
    }

    @Post(':id/upload-image')
    @Permissions('division:create', 'division:update')
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
        const result: CloudinaryResponse =
            await this.cloudinaryService.uploadFile(file);
        await this.adminDivisionService.update(id, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            image_url: result.secure_url,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { image_url: result.secure_url };
    }
}

import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Post,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminSettingService } from '../service/admin-setting.service';
import { UpdateSiteSettingDTO } from '../dto/admin-setting.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CloudinaryResponse } from '../../cloudinary/cloudinary-response';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/settings')
export class AdminSettingController {
    constructor(
        private readonly adminSettingService: AdminSettingService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Lấy cấu hình site settings' })
    async getSettings() {
        return this.adminSettingService.getSettings();
    }

    @Put()
    @ApiOperation({ summary: 'Cập nhật site settings' })
    async updateSettings(@Body() dto: UpdateSiteSettingDTO) {
        return this.adminSettingService.updateSettings(dto);
    }

    @Post('upload')
    @ApiOperation({
        summary:
            'Upload media file (logo, favicon, background, banner) lên Cloudinary',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                type: {
                    type: 'string',
                    enum: ['logo', 'favicon', 'background', 'banner'],
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, cb) => {
                if (
                    !file.mimetype.match(/\/(jpg|jpeg|png|gif|ico|svg|webp)$/)
                ) {
                    return cb(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        }),
    )
    async uploadMedia(@UploadedFile() file: Express.Multer.File) {
        const result: CloudinaryResponse =
            await this.cloudinaryService.uploadFile(file);
        return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            url: result.secure_url,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            public_id: result.public_id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            filename: result.original_filename,
        };
    }
}

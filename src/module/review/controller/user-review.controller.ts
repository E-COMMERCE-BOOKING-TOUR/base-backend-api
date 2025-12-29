import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserReviewService } from '../service/user-review.service';
import { CloudinaryService } from '@/module/cloudinary/cloudinary.service';
import sharp from 'sharp';
import { AuthGuard } from '@nestjs/passport';
import {
    CreateReviewUserDTO,
    ReviewDetailDTO,
    ReviewSummaryDTO,
} from '../dto/review.dto';
import { UnauthorizedResponseDto } from '@/module/user/dtos';
import { JwtOptionalGuard } from '@/module/user/guard/jwt-optional.guard';

@ApiTags('User review')
@Controller('user/review')
export class UserReviewController {
    constructor(
        private readonly userReviewService: UserReviewService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FilesInterceptor('images', 2))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo đánh giá mới (Cần đăng nhập, tối đa 2 ảnh)' })
    @ApiResponse({ status: 201, type: ReviewDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({ type: CreateReviewUserDTO })
    async create(
        @User() user: UserEntity,
        @Body() dto: CreateReviewUserDTO,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        if (files && files.length > 0) {
            const imageUrls = await Promise.all(
                files.map(async (file) => {
                    // Compress image to ~1MB
                    const compressedBuffer = await sharp(file.buffer)
                        .resize({
                            width: 1920,
                            height: 1080,
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                        .jpeg({ quality: 80, progressive: true })
                        .toBuffer();

                    // Create a mock Multer file for CloudinaryService
                    const mockFile: Express.Multer.File = {
                        ...file,
                        buffer: compressedBuffer,
                        size: compressedBuffer.length,
                    };

                    const result =
                        await this.cloudinaryService.uploadFile(mockFile);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return result.url;
                }),
            );

            dto.images = imageUrls.map((url) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                image_url: url,
                is_visible: true,
                sort_no: 0,
            }));
        }

        return this.userReviewService.create(user.id, dto);
    }

    @Get('tour/:tourId')
    @UseGuards(JwtOptionalGuard)
    @ApiOperation({ summary: 'Lấy các đánh giá của một tour' })
    @ApiResponse({ status: 200, type: [ReviewSummaryDTO] })
    @ApiParam({ name: 'tourId', type: Number, example: 1 })
    async getReviewsByTour(
        @Param('tourId') tourId: number,
        @User() user?: UserEntity,
    ) {
        return this.userReviewService.getReviewsByTour(tourId, user?.id);
    }
    @Post('helpful/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đánh dấu review hữu ích' })
    @ApiResponse({ status: 200, type: ReviewDetailDTO })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async markHelpful(@Param('id') id: number, @User() user: UserEntity) {
        return this.userReviewService.markHelpful(id, user.id);
    }

    @Post('report/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Báo cáo review' })
    @ApiResponse({ status: 200, type: ReviewDetailDTO })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    async reportReview(@Param('id') id: number) {
        return this.userReviewService.reportReview(id);
    }
}

import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleImageDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @ApiProperty({
        description: 'Đường dẫn ảnh bài viết',
        example: 'https://example.com/image.jpg',
    })
    image_url: string;
}

@ApiSchema({ name: 'CreateArticleRequest' })
export class ArticleDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({
        description: 'Tiêu đề bài viết',
        example: 'Kinh nghiệm du lịch Đà Lạt',
    })
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @ApiProperty({
        description: 'Nội dung bài viết',
        example: 'Nội dung chi tiết về chuyến đi...',
    })
    content: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({
        description: 'ID tour',
        example: 1,
    })
    tour_id?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Hiển thị bài viết',
        default: false,
        example: true,
    })
    is_visible?: boolean;

    @IsOptional()
    @ApiProperty({
        description: 'Người viết bài',
        example: 'uuid-string',
    })
    user_id: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ArticleImageDTO)
    @ApiProperty({
        description: 'Danh sách ảnh bài viết',
        type: [ArticleImageDTO],
    })
    images?: ArticleImageDTO[];

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Thời tiết khi đăng bài', required: false })
    weather?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiProperty({ description: 'Ngày tạo', required: false })
    created_at?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiProperty({ description: 'Ngày cập nhật', required: false })
    updated_at?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiProperty({ description: 'Ngày xóa', required: false })
    deleted_at?: Date;
}

export class ArticleImageDetailDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    image_url: string;

    constructor(partial: Partial<ArticleImageDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class ArticleCommentDetailDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    content: string;

    @ApiProperty()
    user_id: string;

    @ApiProperty({ nullable: true })
    parent_id?: number | null;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiProperty({ description: 'Ngày tạo', required: false })
    created_at?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiProperty({ description: 'Ngày cập nhật', required: false })
    updated_at?: Date;

    constructor(partial: Partial<ArticleCommentDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class ArticleDetailDTO extends ArticleDTO {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ description: 'Tags', required: false })
    tags?: string[];

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số lượt xem', required: false })
    count_views?: number;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số lượt thích', required: false })
    count_likes?: number;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số lượng bình luận', required: false })
    count_comments?: number;

    @ApiProperty({
        type: [ArticleCommentDetailDTO],
        description: 'Các bình luận',
    })
    comments: ArticleCommentDetailDTO[];

    @ApiProperty({ description: 'Danh sách người thích', required: false })
    users_like: number[];

    constructor(partial: Partial<ArticleDetailDTO>) {
        super();
        Object.assign(this, partial);
    }
}

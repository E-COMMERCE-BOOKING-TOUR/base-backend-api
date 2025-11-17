import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
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
    @MinLength(10)
    @ApiProperty({
        description: 'Nội dung bài viết',
        example: 'Nội dung chi tiết về chuyến đi...',
    })
    content: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Hiển thị bài viết',
        default: false,
        example: true,
    })
    is_visible?: boolean;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID người viết bài', example: 10 })
    user_id: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ArticleImageDTO)
    @ApiProperty({
        description: 'Danh sách ảnh bài viết',
        type: [ArticleImageDTO],
    })
    images?: ArticleImageDTO[];
}

export class ArticleSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ description: 'Tiêu đề bài viết' })
    title: string;

    @ApiProperty({ description: 'Số lượt xem' })
    count_views: number;

    @ApiProperty({ description: 'Số lượt thích' })
    count_likes: number;

    @ApiProperty({ description: 'Số lượt bình luận' })
    count_comments: number;

    @ApiProperty({ description: 'Hiển thị bài viết' })
    is_visible: boolean;

    @ApiProperty({ description: 'ID người viết bài' })
    user_id: number;

    constructor(partial: Partial<ArticleSummaryDTO>) {
        Object.assign(this, partial);
    }
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
    user_id: number;

    @ApiProperty({ nullable: true })
    parent_id?: number | null;

    constructor(partial: Partial<ArticleCommentDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class ArticleDetailDTO extends ArticleSummaryDTO {
    @ApiProperty({ description: 'Nội dung bài viết' })
    content: string;

    @ApiProperty({ type: [ArticleImageDetailDTO] })
    images: ArticleImageDetailDTO[];

    @ApiProperty({ type: [ArticleCommentDetailDTO] })
    comments: ArticleCommentDetailDTO[];

    constructor(partial: Partial<ArticleDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

export class UserArticlePopularDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Introducing the charm of the paradise' })
    title: string;

    @ApiProperty({ example: 'Would you like to spend an extraordinary moment...' })
    description: string;

    @ApiProperty({ example: '/assets/images/travel.jpg' })
    image: string;

    @ApiProperty({ type: [String], example: ['#travel', '#beach'] })
    tags: string[];

    @ApiProperty({ example: '2 days ago', required: false })
    timestamp?: string;

    @ApiProperty({ example: 150 })
    views: number;

    @ApiProperty({ example: 25 })
    likes: number;

    @ApiProperty({ example: 10 })
    comments: number;

    constructor(partial: Partial<UserArticlePopularDTO>) {
        Object.assign(this, partial);
    }
}
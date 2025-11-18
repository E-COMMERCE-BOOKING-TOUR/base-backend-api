import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    MinLength,
    MaxLength,
    ValidateNested,
    IsNumber,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
}

export class ReviewImageDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @ApiProperty({ description: 'URL ảnh đánh giá' })
    image_url: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số thứ tự', required: false })
    sort_no?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Hiển thị', required: false, default: false })
    is_visible?: boolean;
}

@ApiSchema({ name: 'CreateReviewRequest' })
export class ReviewDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @MinLength(2)
    @ApiProperty({ description: 'Tiêu đề đánh giá' })
    title: string;

    @Type(() => Number)
    @IsNumber({ allowInfinity: false, allowNaN: false })
    @Min(0)
    @ApiProperty({ description: 'Số sao đánh giá', example: 5 })
    rating: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @ApiProperty({ description: 'Nội dung' })
    content: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số thứ tự', required: false })
    sort_no?: number;

    @IsOptional()
    @IsEnum(ReviewStatus)
    @ApiProperty({
        description: 'Trạng thái đánh giá',
        enum: ReviewStatus,
        default: ReviewStatus.pending,
    })
    status?: ReviewStatus;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID người dùng' })
    user_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID tour' })
    tour_id: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReviewImageDTO)
    @ApiProperty({
        description: 'Ảnh đánh giá',
        required: false,
        type: [ReviewImageDTO],
    })
    images?: ReviewImageDTO[];

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

export class ReviewImageDetailDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    image_url: string;

    @ApiProperty({ required: false })
    sort_no?: number;

    @ApiProperty({ required: false })
    is_visible?: boolean;

    constructor(partial: Partial<ReviewImageDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class ReviewSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    rating: number;

    @ApiProperty({ enum: ReviewStatus })
    status: ReviewStatus;

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    tour_id: number;

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

    constructor(partial: Partial<ReviewSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class ReviewDetailDTO extends ReviewSummaryDTO {
    @ApiProperty()
    content: string;

    @ApiProperty({ required: false })
    sort_no?: number;

    @ApiProperty({ type: [ReviewImageDetailDTO] })
    images: ReviewImageDetailDTO[];

    constructor(partial: Partial<ReviewDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

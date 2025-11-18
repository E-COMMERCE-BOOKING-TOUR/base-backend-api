import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
    welcome = 'welcome',
    feature = 'feature',
    promotion = 'promotion',
    payment = 'payment',
    booking = 'booking',
    reminder = 'reminder',
    review = 'review',
    recommendation = 'recommendation',
    profile = 'profile',
    alert = 'alert',
    update = 'update',
    reward = 'reward',
    maintenance = 'maintenance',
    policy = 'policy',
}

@ApiSchema({ name: 'CreateNotificationRequest' })
export class NotificationDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @MinLength(2)
    @ApiProperty({ description: 'Tiêu đề thông báo' })
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @ApiProperty({ description: 'Nội dung thông báo' })
    description: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @ApiProperty({ description: 'Loại thông báo' })
    type: NotificationType;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Thông báo lỗi',
        required: false,
        default: false,
    })
    is_error?: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Thông báo liên quan người dùng',
        required: false,
        default: false,
    })
    is_user?: boolean;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @ApiProperty({
        description: 'Danh sách ID người dùng',
        required: false,
        type: [Number],
    })
    user_ids?: number[];

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

export class NotificationSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    type: NotificationType;

    @ApiProperty()
    is_error: boolean;

    @ApiProperty()
    is_user: boolean;

    @ApiProperty({ type: [Number] })
    user_ids: number[];

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

    constructor(partial: Partial<NotificationSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class NotificationDetailDTO extends NotificationSummaryDTO {
    @ApiProperty()
    description: string;

    constructor(partial: Partial<NotificationDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

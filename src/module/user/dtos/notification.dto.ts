import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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
    type: string;

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
}

export class NotificationSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    is_error: boolean;

    @ApiProperty()
    is_user: boolean;

    constructor(partial: Partial<NotificationSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class NotificationDetailDTO extends NotificationSummaryDTO {
    @ApiProperty()
    description: string;

    @ApiProperty({ type: [Number] })
    user_ids: number[];

    constructor(partial: Partial<NotificationDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    Matches,
    Min,
    ValidateNested,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingStatus {
    pending = 'pending',
    confirmed = 'confirmed',
    cancelled = 'cancelled',
    expired = 'expired',
}

export enum PaymentStatus {
    unpaid = 'unpaid',
    paid = 'paid',
    refunded = 'refunded',
    partial = 'partial',
}

export class BookingItemDTO {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID biến thể tour', example: 1 })
    variant_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID loại khách', example: 1 })
    pax_type_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID lịch chạy tour', example: 1 })
    tour_session_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Số lượng khách', example: 2 })
    quantity: number;
}

@ApiSchema({ name: 'CreateBookingRequest' })
export class BookingDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({ description: 'Tên người liên hệ', example: 'Nguyễn Văn A' })
    contact_name: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Email người liên hệ',
        example: 'example@email.com',
    })
    contact_email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(\+?\d{9,15})$/, {
        message:
            'Số điện thoại chỉ gồm số, có thể bắt đầu bằng dấu +, độ dài 9-15 ký tự.',
    })
    @ApiProperty({ description: 'SĐT người đặt tour', example: '+84901234567' })
    contact_phone: string;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
    @Min(0)
    @ApiProperty({ description: 'Tổng tiền đặt tour', example: 2500000 })
    total_amount: number;

    @IsOptional()
    @IsEnum(BookingStatus)
    @ApiProperty({
        description: 'Trạng thái đặt tour',
        enum: BookingStatus,
        default: BookingStatus.pending,
        example: BookingStatus.pending,
    })
    status?: BookingStatus;

    @IsOptional()
    @IsEnum(PaymentStatus)
    @ApiProperty({
        description: 'Trạng thái thanh toán',
        enum: PaymentStatus,
        default: PaymentStatus.unpaid,
        example: PaymentStatus.unpaid,
    })
    payment_status?: PaymentStatus;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID người đặt tour', example: 10 })
    user_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID tiền tệ đặt tour', example: 1 })
    currency_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID thông tin thanh toán', example: 5 })
    payment_information_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID giữ chỗ tour', example: 100 })
    tour_inventory_hold_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID phương thức thanh toán', example: 2 })
    booking_payment_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingItemDTO)
    @ApiProperty({
        description: 'Danh sách các mục đặt tour',
        type: [BookingItemDTO],
        example: [
            { variant_id: 1, pax_type_id: 1, tour_session_id: 1, quantity: 2 },
            { variant_id: 1, pax_type_id: 2, tour_session_id: 1, quantity: 1 },
        ],
    })
    booking_items: BookingItemDTO[];
}

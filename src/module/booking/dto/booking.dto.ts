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
    MaxLength,
    Min,
    ValidateNested,
    IsNumber,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingStatus {
    pending_info = 'pending_info',
    pending_payment = 'pending_payment',
    pending_confirm = 'pending_confirm',
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

    @IsString()
    @ApiProperty({ description: 'Tên loại khách', example: 'Adult' })
    pax_type_name: string;

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
    @MinLength(6)
    @MaxLength(32)
    @ApiProperty({ description: 'SĐT người đặt tour', example: '0901234567' })
    contact_phone: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
    @Min(0)
    @ApiProperty({
        description: 'Tổng tiền đặt tour',
        example: 2500000,
        required: false,
    })
    total_amount?: number;

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
            {
                variant_id: 1,
                pax_type_id: 1,
                tour_session_id: 1,
                quantity: 2,
                pax_type_name: 'Adult',
            },
            {
                variant_id: 1,
                pax_type_id: 2,
                tour_session_id: 1,
                quantity: 1,
                pax_type_name: 'Child',
            },
        ],
    })
    booking_items: BookingItemDTO[];

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

export class BookingSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    contact_name: string;

    @ApiProperty()
    contact_email: string;

    @ApiProperty()
    contact_phone: string;

    @ApiProperty()
    total_amount: number;

    @ApiProperty({ enum: BookingStatus })
    status: BookingStatus;

    @ApiProperty({ enum: PaymentStatus })
    payment_status: PaymentStatus;

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    currency_id: number;

    @ApiProperty()
    booking_payment_id: number;

    constructor(partial: Partial<BookingSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class BookingItemDetailDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    total_amount: number;

    @ApiProperty()
    unit_price: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    variant_id: number;

    @ApiProperty()
    pax_type_id: number;

    @ApiProperty()
    tour_session_id: number;

    constructor(partial: Partial<BookingItemDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class BookingDetailDTO extends BookingSummaryDTO {
    @ApiProperty()
    payment_information_id: number;

    @ApiProperty()
    tour_inventory_hold_id: number;

    @ApiProperty({ type: [BookingItemDetailDTO] })
    booking_items: BookingItemDetailDTO[];

    constructor(partial: Partial<BookingDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

export class BookingPassengerDTO {
    @ApiProperty()
    full_name: string;

    @ApiProperty()
    phone_number: string;

    @ApiProperty()
    pax_type_name: string;
}

export class UserBookingDetailDTO {
    @ApiProperty()
    id: number;

    @ApiProperty()
    contact_name: string;

    @ApiProperty()
    contact_email: string;

    @ApiProperty()
    contact_phone: string;

    @ApiProperty()
    total_amount: number;

    @ApiProperty()
    status: string;

    @ApiProperty()
    payment_status: string;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    tour_title: string;

    @ApiProperty()
    tour_image: string;

    @ApiProperty()
    tour_location: string;

    @ApiProperty()
    start_date: Date;

    @ApiProperty()
    duration_days: number;

    @ApiProperty()
    duration_hours: number;

    @ApiProperty()
    hold_expires_at: Date;

    @ApiProperty({ type: [BookingItemDTO] })
    items: BookingItemDTO[];

    @ApiProperty({ type: [BookingPassengerDTO] })
    passengers: BookingPassengerDTO[];

    @ApiProperty({ required: false })
    booking_payment?: {
        id: number;
        payment_method_name: string;
    };

    @ApiProperty({ required: false })
    payment_information?: {
        brand?: string;
        last4?: string;
        expiry_date?: string;
        account_holder?: string;
    };
}

export class ConfirmBookingDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    booking_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    contact_email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    payment_method: string;
}

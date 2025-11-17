import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    Min,
    MinLength,
    MaxLength,
    ValidateNested,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TourStatus {
    draft = 'draft',
    active = 'active',
    inactive = 'inactive',
}

export enum TourVariantStatus {
    active = 'active',
    inactive = 'inactive',
}

export enum TourSessionStatus {
    open = 'open',
    closed = 'closed',
    full = 'full',
    cancelled = 'cancelled',
}

export enum PriceType {
    absolute = 'absolute',
    delta = 'delta',
}

export class TourImageDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @ApiProperty({
        description: 'URL ảnh tour',
        example: 'https://example.com/image.jpg',
    })
    image_url: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số thứ tự', required: false, example: 1 })
    sort_no?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Ảnh cover', required: false, example: false })
    is_cover?: boolean;
}

@ApiSchema({ name: 'CreateTourRequest' })
export class TourDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({ description: 'Tên tour' })
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @ApiProperty({ description: 'Mô tả tour' })
    description: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @ApiProperty({ description: 'Tóm tắt tour' })
    summary: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'URL bản đồ tour', required: false })
    map_url?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    @ApiProperty({ description: 'Slug tour' })
    slug: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Địa chỉ tour' })
    address: string;

    @Type(() => Number)
    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
    @Min(0)
    @ApiProperty({ description: 'Thuế tour (%)', example: 0 })
    tax: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Hiển thị', required: false, default: false })
    is_visible?: boolean;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: 'Ngày công bố tour', required: false })
    published_at?: string;

    @IsOptional()
    @IsEnum(TourStatus)
    @ApiProperty({
        description: 'Trạng thái tour',
        enum: TourStatus,
        default: TourStatus.inactive,
    })
    status?: TourStatus;

    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Thời gian tour (giờ)', required: false })
    duration_hours?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Thời gian tour (ngày)', required: false })
    duration_days?: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Số lượng người tối thiểu', example: 1 })
    min_pax: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Số lượng người tối đa', required: false })
    max_pax?: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID quốc gia' })
    country_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID phân cấp' })
    division_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID tiền tệ' })
    currency_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID nhà cung cấp' })
    supplier_id: number;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @ApiProperty({
        description: 'Danh sách ID danh mục',
        required: false,
        type: [Number],
    })
    tour_category_ids?: number[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TourImageDTO)
    @ApiProperty({
        description: 'Danh sách ảnh tour',
        required: false,
        type: [TourImageDTO],
    })
    images?: TourImageDTO[];
}

export class TourVariantDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({ description: 'Tên biến thể tour' })
    name: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ description: 'Số thứ tự', required: false })
    sort_no?: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Số lượng tối thiểu mỗi đơn' })
    min_pax_per_booking: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Sức chứa mỗi slot', required: false })
    capacity_per_slot?: number;

    @IsBoolean()
    @ApiProperty({ description: 'Thuế đã được bao gồm' })
    tax_included: boolean;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Thời gian chặn trước khởi hành (giờ)' })
    cutoff_hours: number;

    @IsEnum(TourVariantStatus)
    @ApiProperty({
        description: 'Trạng thái biến thể',
        enum: TourVariantStatus,
    })
    status: TourVariantStatus;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID tour' })
    tour_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID tiền tệ' })
    currency_id: number;
}

export class TourSessionDTO {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID biến thể tour' })
    tour_variant_id: number;

    @IsDateString()
    @ApiProperty({ description: 'Ngày chạy' })
    session_date: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Giờ bắt đầu (HH:mm:ss)', required: false })
    start_time?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Giờ kết thúc (HH:mm:ss)', required: false })
    end_time?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'Sức chứa slot', required: false })
    capacity?: number;

    @IsEnum(TourSessionStatus)
    @ApiProperty({
        description: 'Trạng thái slot',
        enum: TourSessionStatus,
        default: TourSessionStatus.open,
    })
    status: TourSessionStatus;
}

export class TourPolicyRuleDTO {
    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Hủy trước X giờ' })
    before_hours: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Tỷ lệ phí hủy (%)' })
    fee_pct: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Thứ tự áp rule' })
    sort_no: number;
}

export class TourPolicyDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({ description: 'Tên chính sách' })
    name: string;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID biến thể tour' })
    tour_variant_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TourPolicyRuleDTO)
    @ApiProperty({ description: 'Danh sách rule', type: [TourPolicyRuleDTO] })
    rules: TourPolicyRuleDTO[];
}

export class TourVariantPaxTypePriceDTO {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID biến thể tour' })
    tour_variant_id: number;

    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID loại khách' })
    pax_type_id: number;

    @Type(() => Number)
    @IsNumber({ allowInfinity: false, allowNaN: false })
    @Min(0)
    @ApiProperty({ description: 'Giá áp cho loại khách' })
    price: number;
}

export class TourRulePaxTypePriceDTO {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID loại khách' })
    pax_type_id: number;

    @Type(() => Number)
    @IsNumber({ allowInfinity: false, allowNaN: false })
    @Min(0)
    @ApiProperty({ description: 'Giá áp theo rule' })
    price: number;
}

export class TourPriceRuleDTO {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID biến thể tour' })
    tour_variant_id: number;

    @IsDateString()
    @ApiProperty({ description: 'Ngày bắt đầu hiệu lực rule' })
    start_date: string;

    @IsDateString()
    @ApiProperty({ description: 'Ngày kết thúc hiệu lực rule' })
    end_date: string;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Bitmask ngày trong tuần' })
    weekday_mask: number;

    @IsEnum(PriceType)
    @ApiProperty({ description: 'Kiểu giá', enum: PriceType })
    price_type: PriceType;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Độ ưu tiên' })
    priority: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TourRulePaxTypePriceDTO)
    @ApiProperty({
        description: 'Giá theo loại khách',
        type: [TourRulePaxTypePriceDTO],
    })
    rule_prices: TourRulePaxTypePriceDTO[];
}

export class TourImageDetailDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    image_url: string;

    @ApiProperty({ required: false })
    sort_no?: number;

    @ApiProperty({ required: false })
    is_cover?: boolean;

    constructor(partial: Partial<TourImageDetailDTO>) {
        Object.assign(this, partial);
    }
}

export class TourVariantSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: TourVariantStatus })
    status: TourVariantStatus;

    constructor(partial: Partial<TourVariantSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class TourSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty({ enum: TourStatus })
    status: TourStatus;

    @ApiProperty()
    is_visible: boolean;

    @ApiProperty()
    score_rating: number;

    @ApiProperty()
    tax: number;

    @ApiProperty()
    min_pax: number;

    @ApiProperty({ required: false })
    max_pax?: number;

    @ApiProperty()
    currency_id: number;

    @ApiProperty()
    supplier_id: number;

    constructor(partial: Partial<TourSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class TourDetailDTO extends TourSummaryDTO {
    @ApiProperty()
    description: string;

    @ApiProperty()
    summary: string;

    @ApiProperty({ required: false })
    map_url?: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    country_id: number;

    @ApiProperty()
    division_id: number;

    @ApiProperty({ type: [Number] })
    tour_category_ids: number[];

    @ApiProperty({ type: [TourImageDetailDTO] })
    images: TourImageDetailDTO[];

    @ApiProperty({ type: [TourVariantSummaryDTO] })
    variants: TourVariantSummaryDTO[];

    constructor(partial: Partial<TourDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Min,
    ValidateNested,
} from 'class-validator';

export class BookingPaxDto {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: 'ID loại khách', example: 1 })
    paxTypeId: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ description: 'Số lượng khách', example: 1 })
    quantity: number;
}

export class CreateBookingDto {
    @IsNotEmpty()
    @IsDateString()
    @ApiProperty({ description: 'Ngày khởi hành', example: '2023-12-25' })
    startDate: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingPaxDto)
    @ApiProperty({
        description: 'Danh sách số lượng khách theo loại',
        type: [BookingPaxDto],
        example: [
            { paxTypeId: 1, quantity: 2 },
            { paxTypeId: 2, quantity: 1 },
        ],
    })
    pax: BookingPaxDto[];

    @IsOptional()
    @IsInt()
    @ApiProperty({
        description: 'ID biến thể tour (optional)',
        example: 1,
        required: false,
    })
    variantId?: number;

    @IsOptional()
    @IsInt()
    @ApiProperty({
        description: 'ID session tour (optional)',
        example: 10,
        required: false,
    })
    tourSessionId?: number;
}

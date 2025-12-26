import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCurrencyDTO {
    @ApiProperty({ description: 'Tên tiền tệ', example: 'Việt Nam Đồng' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ description: 'Ký hiệu tiền tệ', example: '₫' })
    @IsString()
    @MaxLength(5)
    symbol: string;
}

export class UpdateCurrencyDTO {
    @ApiPropertyOptional({ description: 'Tên tiền tệ', example: 'Việt Nam Đồng' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({ description: 'Ký hiệu tiền tệ', example: '₫' })
    @IsOptional()
    @IsString()
    @MaxLength(5)
    symbol?: string;
}

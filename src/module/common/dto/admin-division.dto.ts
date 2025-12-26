import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateDivisionDTO {
    @ApiProperty({ description: 'Tên division', example: 'Hà Nội' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ description: 'Tên local', example: 'Hà Nội' })
    @IsString()
    @MaxLength(255)
    name_local: string;

    @ApiPropertyOptional({ description: 'Mức độ phân cấp', example: 1 })
    @IsOptional()
    @IsNumber()
    level?: number;

    @ApiPropertyOptional({ description: 'Mã bưu chính', example: '100000' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    code?: string;

    @ApiPropertyOptional({ description: 'URL hình ảnh đại diện', example: 'https://res.cloudinary.com/...' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    image_url?: string;

    @ApiProperty({ description: 'ID Quốc gia', example: 1 })
    @IsNumber()
    country_id: number;

    @ApiPropertyOptional({ description: 'ID Division cha', example: null })
    @IsOptional()
    @IsNumber()
    parent_id?: number | null;
}

export class UpdateDivisionDTO {
    @ApiPropertyOptional({ description: 'Tên division', example: 'Hà Nội' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({ description: 'Tên local', example: 'Hà Nội' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name_local?: string;

    @ApiPropertyOptional({ description: 'Mức độ phân cấp', example: 1 })
    @IsOptional()
    @IsNumber()
    level?: number;

    @ApiPropertyOptional({ description: 'Mã bưu chính', example: '100000' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    code?: string;

    @ApiPropertyOptional({ description: 'URL hình ảnh đại diện', example: 'https://res.cloudinary.com/...' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    image_url?: string;

    @ApiPropertyOptional({ description: 'ID Quốc gia', example: 1 })
    @IsOptional()
    @IsNumber()
    country_id?: number;

    @ApiPropertyOptional({ description: 'ID Division cha', example: null })
    @IsOptional()
    @IsNumber()
    parent_id?: number | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateStaticPageDTO {
    @ApiProperty({ description: 'Page title' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty({ description: 'URL slug' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    slug: string;

    @ApiPropertyOptional({ description: 'HTML/Markdown content' })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional({ description: 'SEO title' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    meta_title?: string;

    @ApiPropertyOptional({ description: 'SEO description' })
    @IsString()
    @IsOptional()
    meta_description?: string;

    @ApiPropertyOptional({ description: 'Is page active', default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

export class UpdateStaticPageDTO {
    @ApiPropertyOptional({ description: 'Page title' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @ApiPropertyOptional({ description: 'URL slug' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    slug?: string;

    @ApiPropertyOptional({ description: 'HTML/Markdown content' })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional({ description: 'SEO title' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    meta_title?: string;

    @ApiPropertyOptional({ description: 'SEO description' })
    @IsString()
    @IsOptional()
    meta_description?: string;

    @ApiPropertyOptional({ description: 'Is page active' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

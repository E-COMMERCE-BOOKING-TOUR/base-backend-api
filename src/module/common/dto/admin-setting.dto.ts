import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class UpdateSiteSettingDTO {
    // SEO Settings
    @ApiPropertyOptional({
        description: 'Site title',
        example: 'TripConnect - Travel Booking',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    site_title?: string;

    @ApiPropertyOptional({ description: 'Meta description for SEO' })
    @IsOptional()
    @IsString()
    meta_description?: string;

    @ApiPropertyOptional({ description: 'Meta keywords for SEO' })
    @IsOptional()
    @IsString()
    meta_keywords?: string;

    // Media Assets
    @ApiPropertyOptional({ description: 'Logo URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    logo_url?: string;

    @ApiPropertyOptional({ description: 'Favicon URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    favicon_url?: string;

    @ApiPropertyOptional({ description: 'Square banner URLs', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    banners_square?: string[];

    @ApiPropertyOptional({
        description: 'Rectangular banner URLs',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    banners_rectangle?: string[];

    // Footer Information
    @ApiPropertyOptional({
        description: 'Company name',
        example: 'TripConnect Company',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    company_name?: string;

    @ApiPropertyOptional({ description: 'Company address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+84 123 456 789',
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({
        description: 'Contact email',
        example: 'contact@tripconnect.com',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    email?: string;

    // Social Links
    @ApiPropertyOptional({ description: 'Facebook URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    facebook_url?: string;

    @ApiPropertyOptional({ description: 'Instagram URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    instagram_url?: string;

    @ApiPropertyOptional({ description: 'Twitter/X URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    twitter_url?: string;

    @ApiPropertyOptional({ description: 'YouTube URL' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    youtube_url?: string;

    @ApiPropertyOptional({ description: 'Footer description/about text' })
    @IsOptional()
    @IsString()
    footer_description?: string;

    @ApiPropertyOptional({
        description: 'Copyright text',
        example: '© 2024 TripConnect',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    copyright_text?: string;
}

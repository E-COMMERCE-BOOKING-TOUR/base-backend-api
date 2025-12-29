import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('site_settings')
export class SiteSettingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // SEO Settings
    @Column({ type: 'varchar', length: 255, default: 'TripConnect' })
    @ApiProperty({ description: 'Site title' })
    site_title: string;

    @Column({ type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Meta description for SEO' })
    meta_description: string | null;

    @Column({ type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Meta keywords for SEO' })
    meta_keywords: string | null;

    // Media Assets
    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'Logo URL' })
    logo_url: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'Favicon URL' })
    favicon_url: string | null;

    @Column({ type: 'simple-json', nullable: true })
    @ApiPropertyOptional({ description: 'Square banner URLs', type: [String] })
    banners_square: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    @ApiPropertyOptional({
        description: 'Rectangular banner URLs',
        type: [String],
    })
    banners_rectangle: string[] | null;

    // Footer Information
    @Column({ type: 'varchar', length: 255, nullable: true })
    @ApiPropertyOptional({ description: 'Company name' })
    company_name: string | null;

    @Column({ type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Company address' })
    address: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    @ApiPropertyOptional({ description: 'Phone number' })
    phone: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @ApiPropertyOptional({ description: 'Contact email' })
    email: string | null;

    // Social Links
    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'Facebook URL' })
    facebook_url: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'Instagram URL' })
    instagram_url: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'Twitter/X URL' })
    twitter_url: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    @ApiPropertyOptional({ description: 'YouTube URL' })
    youtube_url: string | null;

    @Column({ type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Footer description/about text' })
    footer_description: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @ApiPropertyOptional({ description: 'Copyright text' })
    copyright_text: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

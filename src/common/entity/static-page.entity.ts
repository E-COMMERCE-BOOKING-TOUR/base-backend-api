import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntityTimestamp } from './BaseEntityTimestamp';

@Entity('static_pages')
@Unique(['slug'])
export class StaticPageEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    @ApiProperty({ description: 'Page title' })
    title: string;

    @Column({ type: 'varchar', length: 255 })
    @ApiProperty({ description: 'URL slug' })
    slug: string;

    @Column({ type: 'longtext', nullable: true })
    @ApiPropertyOptional({ description: 'HTML/Markdown content' })
    content: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @ApiPropertyOptional({ description: 'SEO title' })
    meta_title: string | null;

    @Column({ type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'SEO description' })
    meta_description: string | null;

    @Column({ type: 'boolean', default: true })
    @ApiProperty({ description: 'Is page active' })
    is_active: boolean;
}

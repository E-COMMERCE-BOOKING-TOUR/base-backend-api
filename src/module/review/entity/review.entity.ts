import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ImageReviewEntity } from './imageReview.entity';

@Index()
@Entity('review')
export class ReviewEntity extends BaseEntityTimestamp {
    @Exclude()
    @PrimaryGeneratedColumn()
    public id: number;

    @ApiProperty({ description: 'Tiêu đề review' })
    public title: string;

    @ApiProperty({ description: 'Nội dung review' })
    public content: string;

    @ApiProperty({ description: 'Đánh giá review' })
    public rating: number;

    @Column({ type: 'boolean', default: false })
    public status: string;

    @Column({ type: 'boolean', default: false })
    public sort_no: string;

    @ApiProperty({ description: 'ID người dùng' })
    @OneToMany(() => ImageReviewEntity, (image) => image.review)
    public images: ImageReviewEntity[];
}

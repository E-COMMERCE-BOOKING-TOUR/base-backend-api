import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';

@Index()
@Entity('image_review')
export class ImageReviewEntity extends BaseEntityTimestamp {
    @Exclude()
    @PrimaryGeneratedColumn()
    public id: number;

    @ApiProperty({ description: 'Ảnh review' })
    public image_url: string;

    @Exclude()
    @ManyToOne(() => ReviewEntity, (review) => review.images)
    public review: ReviewEntity;
}

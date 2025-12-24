import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewImageEntity } from './reviewImage.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { ReviewHelpfulEntity } from './reviewHelpful.entity';

@Entity('reviews')
export class ReviewEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tiêu đề đánh giá' })
    title: string;

    @Column({
        type: 'tinyint',
        default: 0,
    })
    @ApiProperty({ description: 'Số sao đánh giá' })
    rating: number;

    @Column({
        type: 'text',
    })
    @ApiProperty({ description: 'Nội dung' })
    content: string;

    @Column({
        type: 'tinyint',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số thứ tự' })
    sort_no: number;

    @Column({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
    })
    @ApiProperty({ description: 'Trạng thái đánh giá' })
    status: string;

    @ManyToOne(() => UserEntity, (user) => user.reviews, { nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người dùng', type: () => UserEntity })
    user: UserEntity;

    @OneToMany(() => ReviewImageEntity, (image) => image.review)
    @ApiProperty({
        description: 'Ảnh đánh giá',
        type: () => [ReviewImageEntity],
    })
    images: ReviewImageEntity[];

    @ManyToOne(() => TourEntity, (tour) => tour.reviews, { nullable: false })
    @JoinColumn({ name: 'tour_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tour', type: () => TourEntity })
    tour: TourEntity;

    @Column({
        type: 'int',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượt hữu ích' })
    helpful_count: number;

    @Column({
        type: 'boolean',
        default: false,
    })
    @ApiProperty({ description: 'Đã bị báo cáo' })
    is_reported: boolean;

    @OneToMany(() => ReviewHelpfulEntity, (helpful) => helpful.review)
    helpful_votes: ReviewHelpfulEntity[];
}

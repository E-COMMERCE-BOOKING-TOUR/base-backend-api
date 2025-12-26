import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ReviewEntity } from './review.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('review_helpful')
export class ReviewHelpfulEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReviewEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'review_id' })
    @ApiProperty({ type: () => ReviewEntity })
    review: ReviewEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @ApiProperty({ type: () => UserEntity })
    user: UserEntity;
}

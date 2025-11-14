import { BaseEntityTimestamp } from "@/common/entity/BaseEntityTimestamp";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm";
import { ReviewEntity } from "./review.entity";

@Entity('review_images')
export class ReviewImageEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    image_url: string;

    @Column({
        type: 'tinyint',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số thứ tự' })
    sort_no: number;

    @Column({
        type: 'bool',
        default: false,
    })
    @ApiProperty({ description: 'Hiển thị' })
    is_visible: boolean;

    @ManyToOne(() => ReviewEntity, (review) => review.images, { nullable: false })
    @JoinColumn({ name: 'review_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Đánh giá' })
    review: ReviewEntity;
} 
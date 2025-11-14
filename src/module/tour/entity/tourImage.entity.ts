import { BaseEntityTimestamp } from "@/common/entity/BaseEntityTimestamp";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TourEntity } from "./tour.entity";

@Entity('tour_images')
export class TourImageEntity extends BaseEntityTimestamp {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'URL ảnh tour' })
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
    @ApiProperty({ description: 'Ảnh cover' })
    is_cover: boolean;

    @ManyToOne(() => TourEntity, (tour) => tour.images, { nullable: false })
    @JoinColumn({ name: 'tour_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tour' })
    tour: TourEntity;
}
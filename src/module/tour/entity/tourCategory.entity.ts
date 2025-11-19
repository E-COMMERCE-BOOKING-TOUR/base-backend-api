import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TourEntity } from './tour.entity';

@Entity('tour_categories')
export class TourCategoryEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên danh mục tour' })
    name: string;

    @Column({
        type: 'tinyint',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số thứ tự' })
    sort_no: number;

    @ManyToMany(() => TourEntity, (tour) => tour.tour_categories)
    @ApiProperty({ description: 'Danh sách các tour thuộc danh mục này' })
    tours: TourEntity[];
}

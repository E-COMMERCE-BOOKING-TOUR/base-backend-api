import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { CountryEntity } from './country.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';

@Entity('master_divisions')
export class DivisionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên quốc gia' })
    name: string;

    @Column({
        type: 'mediumint',
        default: 1,
    })
    @ApiProperty({ description: 'Mức độ phân cấp' })
    level: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên phân cấp local' })
    name_local: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    @ApiProperty({ description: 'Mã bưu chính' })
    code: string;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    @ApiProperty({ description: 'URL hình ảnh đại diện' })
    image_url: string;

    @Column({
        type: 'int',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượt xem/tìm kiếm' })
    view_count: number;

    @ManyToOne(() => CountryEntity, (country) => country.divisions, {
        nullable: false,
    })
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Quốc gia', type: () => CountryEntity })
    country: CountryEntity;

    @OneToMany(() => TourEntity, (tour) => tour.division)
    @ApiProperty({
        description: 'Danh sách các tour',
        type: () => [TourEntity],
    })
    tours: TourEntity[];

    @Index()
    @Column({ type: 'int', nullable: true })
    @ApiProperty({ description: 'ID của phân cấp cha' })
    parent_id?: number | null;

    @ManyToOne(() => DivisionEntity, (c) => c.children, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'parent_id' })
    @ApiProperty({ description: 'Phân cấp cha', type: () => DivisionEntity })
    parent?: DivisionEntity | null;

    @OneToMany(() => DivisionEntity, (c) => c.parent)
    @ApiProperty({ description: 'Phân cấp con', type: () => [DivisionEntity] })
    children: DivisionEntity[];
}

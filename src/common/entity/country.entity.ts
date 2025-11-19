import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { DivisionEntity } from './division.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';

@Entity('master_countries')
export class CountryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên quốc gia' })
    name: string;

    @Column({
        type: 'varchar',
        length: 10,
        unique: true,
    })
    @ApiProperty({ description: 'Mã quốc gia ISO 3166-1 alpha-2' })
    iso3: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @ApiProperty({ description: 'Tên quốc gia local' })
    local_name: string | null;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    @ApiProperty({ description: 'Mã điện thoại quốc gia' })
    phone_code: string | null;

    @OneToMany(() => DivisionEntity, (division) => division.country)
    @ApiProperty({ description: 'Danh sách các tỉnh/thành phố' })
    divisions: DivisionEntity[];

    @OneToMany(() => UserEntity, (user) => user.country)
    @ApiProperty({ description: 'Danh sách các người dùng' })
    users: UserEntity[];

    @OneToMany(() => TourEntity, (tour) => tour.country)
    @ApiProperty({ description: 'Danh sách các tour' })
    tours: TourEntity[];
}

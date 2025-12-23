import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';

@Entity('suppliers')
export class SupplierEntity extends BaseEntityTimestamp {
    @Exclude()
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên nhà cung cấp' })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Email nhà cung cấp' })
    email: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    @ApiProperty({ description: 'Số điện thoại nhà cung cấp' })
    phone: string;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'inactive',
    })
    @ApiProperty({ description: 'Trạng thái nhà cung cấp' })
    status: string;

    @OneToMany(() => UserEntity, (user) => user.supplier)
    @ApiProperty({ description: 'Danh sách các người dùng của nhà cung cấp', type: () => [UserEntity] })
    users: UserEntity[];

    @OneToMany(() => TourEntity, (tour) => tour.supplier)
    @ApiProperty({ description: 'Danh sách các tour của nhà cung cấp', type: () => [TourEntity] })
    tours: TourEntity[];
}

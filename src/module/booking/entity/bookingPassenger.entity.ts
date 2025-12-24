import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingItemEntity } from './bookingItem.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';

@Entity('booking_passengers')
export class BookingPassengerEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Họ tên hành khách' })
    full_name: string;

    @Column({
        type: 'date',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Ngày sinh hành khách' })
    birthdate: Date;

    @Column({
        type: 'varchar',
        length: 32,
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số điện thoại hành khách' })
    phone_number: string;

    @ManyToOne(
        () => BookingItemEntity,
        (booking_item) => booking_item.booking_passengers,
        { nullable: false },
    )
    @JoinColumn({ name: 'booking_item_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Mục đặt tour có hành khách này',
        type: () => BookingItemEntity,
    })
    booking_item: BookingItemEntity;

    @ManyToOne(
        () => TourPaxTypeEntity,
        (pax_type) => pax_type.booking_passengers,
        { nullable: false },
    )
    @JoinColumn({ name: 'pax_type_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Loại khách của hành khách này',
        type: () => TourPaxTypeEntity,
    })
    pax_type: TourPaxTypeEntity;
}

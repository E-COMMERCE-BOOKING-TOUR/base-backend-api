import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TourVariantPaxTypePriceEntity } from './tourVariantPaxTypePrice.entity';
import { BookingItemEntity } from '@/module/booking/entity/bookingItem.entity';
import { BookingPassengerEntity } from '@/module/booking/entity/bookingPassenger.entity';

@Entity('tour_pax_types')
export class TourPaxTypeEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên loại khách' })
    name: string;

    @Column({
        type: 'tinyint',
    })
    @ApiProperty({ description: 'Tuổi tối thiểu' })
    min_age: number;

    @Column({
        type: 'tinyint',
    })
    @ApiProperty({ description: 'Tuổi tối đa' })
    max_age: number;

    @OneToMany(
        () => TourVariantPaxTypePriceEntity,
        (tour_variant_pax_type_price) => tour_variant_pax_type_price.pax_type,
    )
    @ApiProperty({ description: 'Giá áp theo rule cho loại khách', type: () => [TourVariantPaxTypePriceEntity] })
    tour_variant_pax_type_prices: TourVariantPaxTypePriceEntity[];

    @OneToMany(() => BookingItemEntity, (booking_item) => booking_item.pax_type)
    @ApiProperty({
        description: 'Danh sách các mục đặt tour có loại khách này',
        type: () => [BookingItemEntity]
    })
    booking_items: BookingItemEntity[];

    @OneToMany(
        () => BookingPassengerEntity,
        (booking_passenger) => booking_passenger.pax_type,
    )
    @ApiProperty({ description: 'Danh sách các hành khách có loại khách này', type: () => [BookingPassengerEntity] })
    booking_passengers: BookingPassengerEntity[];
}

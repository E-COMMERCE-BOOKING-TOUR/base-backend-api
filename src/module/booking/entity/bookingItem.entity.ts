import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingEntity } from './booking.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { BookingPassengerEntity } from './bookingPassenger.entity';

@Entity('booking_items')
export class BookingItemEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    @ApiProperty({ description: 'Thành tiền' })
    total_amount: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    @ApiProperty({ description: 'Đơn giá áp cho loại khách tại thời điểm đặt' })
    unit_price: number;

    @Column({
        type: 'int',
        default: 0,
    })
    @ApiProperty({ description: 'Số lượng khách của loại này' })
    quantity: number;

    @ManyToOne(() => BookingEntity, (booking) => booking.booking_items, {
        nullable: false,
    })
    @JoinColumn({ name: 'booking_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Đơn đặt tour' })
    booking: BookingEntity;

    @ManyToOne(() => TourVariantEntity, (variant) => variant.booking_items, {
        nullable: false,
    })
    @JoinColumn({ name: 'variant_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Biến thể tour' })
    variant: TourVariantEntity;

    @ManyToOne(() => TourPaxTypeEntity, (pax_type) => pax_type.booking_items, {
        nullable: false,
    })
    @JoinColumn({ name: 'pax_type_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Loại khách' })
    pax_type: TourPaxTypeEntity;

    @ManyToOne(
        () => TourSessionEntity,
        (tour_session) => tour_session.booking_items,
        { nullable: false },
    )
    @JoinColumn({ name: 'tour_session_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Lịch chạy tour' })
    tour_session: TourSessionEntity;

    @OneToMany(
        () => BookingPassengerEntity,
        (booking_passenger) => booking_passenger.booking_item,
    )
    @ApiProperty({
        description: 'Danh sách các hành khách của mục đặt tour này',
    })
    booking_passengers: BookingPassengerEntity[];
}

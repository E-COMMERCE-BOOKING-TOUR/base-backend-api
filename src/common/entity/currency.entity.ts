import { BookingEntity } from '@/module/booking/entity/booking.entity';
import { BookingPaymentEntity } from '@/module/booking/entity/bookingPayment.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity('master_currencies')
export class CurrencyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên tiền tệ' })
    name: string;

    @Column({
        type: 'varchar',
        length: 5,
    })
    @ApiProperty({ description: 'Ký hiệu tiền tệ' })
    symbol: string;

    @OneToMany(() => TourEntity, (tour) => tour.currency)
    @ApiProperty({
        description: 'Danh sách các tour có tiền tệ này',
        type: () => [TourEntity],
    })
    tours: TourEntity[];

    @OneToMany(() => TourVariantEntity, (variant) => variant.currency)
    @ApiProperty({
        description: 'Danh sách các biến thể tour có tiền tệ này',
        type: () => [TourVariantEntity],
    })
    tour_variants: TourVariantEntity[];

    @OneToMany(() => BookingEntity, (booking) => booking.currency)
    @ApiProperty({
        description: 'Danh sách các đơn đặt tour có tiền tệ này',
        type: () => [BookingEntity],
    })
    bookings: BookingEntity[];

    @OneToMany(
        () => BookingPaymentEntity,
        (booking_payment) => booking_payment.currency,
    )
    @ApiProperty({
        description: 'Danh sách các phương thức thanh toán có tiền tệ này',
        type: () => [BookingPaymentEntity],
    })
    booking_payments: BookingPaymentEntity[];
}

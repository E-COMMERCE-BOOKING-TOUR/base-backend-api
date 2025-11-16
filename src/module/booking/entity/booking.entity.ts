import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingItemEntity } from './bookingItem.entity';
import { BookingPaymentEntity } from './bookingPayment.entity';

@Entity({ name: 'bookings' })
export class BookingEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên người liên hệ' })
    contact_name: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Email người liên hệ' })
    contact_email: string;

    @Column({
        type: 'varchar',
        length: 32,
    })
    @ApiProperty({ description: 'SĐT người đặt tour' })
    contact_phone: string;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    @ApiProperty({ description: 'Tổng tiền đặt tour' })
    total_amount: number;

    @Column({
        type: 'enum',
        enum: ['pending', 'confirmed', 'cancelled', 'expired'],
        default: 'pending',
    })
    @ApiProperty({ description: 'Trạng thái đặt tour' })
    status: string;

    @Column({
        type: 'enum',
        enum: ['unpaid', 'paid', 'refunded', 'partial'],
        default: 'unpaid',
    })
    @ApiProperty({ description: 'Trạng thái thanh toán' })
    payment_status: string;

    @ManyToOne(() => UserEntity, (user) => user.bookings, { nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người đặt tour' })
    user: UserEntity;

    @ManyToOne(() => CurrencyEntity, (currency) => currency.bookings, {
        nullable: false,
    })
    @JoinColumn({ name: 'currency_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tiền tệ đặt tour' })
    currency: CurrencyEntity;

    @ManyToOne(
        () => PaymentInfomationEntity,
        (payment_information) => payment_information.bookings,
        { nullable: false },
    )
    @JoinColumn({ name: 'payment_information_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Thông tin thanh toán' })
    payment_information: PaymentInfomationEntity;

    @OneToOne(
        () => TourInventoryHoldEntity,
        (tour_inventory_hold) => tour_inventory_hold.booking,
        { nullable: false },
    )
    @JoinColumn({ name: 'tour_inventory_hold_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Giữ chỗ tour' })
    tour_inventory_hold: TourInventoryHoldEntity;

    @OneToMany(() => BookingItemEntity, (booking_item) => booking_item.booking)
    @ApiProperty({ description: 'Danh sách các mục đặt tour' })
    booking_items: BookingItemEntity[];

    @ManyToOne(
        () => BookingPaymentEntity,
        (booking_payment) => booking_payment.bookings,
        { nullable: false },
    )
    @JoinColumn({ name: 'booking_payment_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Phương thức thanh toán' })
    booking_payment: BookingPaymentEntity;
}

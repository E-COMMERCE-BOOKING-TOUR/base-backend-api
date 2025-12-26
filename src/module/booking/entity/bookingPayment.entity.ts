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
import { CurrencyEntity } from '@/common/entity/currency.entity';

export enum PaymentCardID {
    CREDIT_CARD = 1, // Credit/Debit Card
    MOMO = 5, // Momo
    VN_PAY = 4, // VnPay
    ZALOPAY = 6, // Zalopay
}

@Entity('booking_payments')
export class BookingPaymentEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên phương thức thanh toán' })
    payment_method_name: string;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    @ApiProperty({ description: 'Số tiền tối thiểu thanh toán' })
    rule_min: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    @ApiProperty({ description: 'Số tiền tối đa thanh toán' })
    rule_max: number;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    @ApiProperty({ description: 'Trạng thái phương thức thanh toán' })
    status: string;

    @OneToMany(() => BookingEntity, (booking) => booking.booking_payment)
    @ApiProperty({
        description:
            'Danh sách các đơn đặt tour đã thanh toán bằng phương thức này',
        type: () => [BookingEntity],
    })
    bookings: BookingEntity[];

    @ManyToOne(() => CurrencyEntity, (currency) => currency.booking_payments, {
        nullable: false,
    })
    @JoinColumn({ name: 'currency_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Tiền tệ của phương thức thanh toán',
        type: () => CurrencyEntity,
    })
    currency: CurrencyEntity;
}

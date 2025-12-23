import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BookingEntity } from '@/module/booking/entity/booking.entity';

@Entity('payment_infomations')
export class PaymentInfomationEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    @ApiProperty({ description: 'Thương hiệu thẻ (Visa, Mastercard, ...)' })
    brand: string | null;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    @ApiProperty({ description: 'Loại funding (credit, debit, prepaid)' })
    funding: string | null;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    @ApiProperty({ description: 'Quốc gia phát hành thẻ' })
    country: string | null;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @ApiProperty({ description: 'Tên chủ thẻ' })
    account_holder: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    @ApiProperty({
        description: 'Trạng thái kiểm tra CVC (pass, fail, unchecked)',
    })
    cvc_check: string | null;

    @Exclude()
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @ApiProperty({ description: 'Stripe Customer ID' })
    customer_id: string | null;

    @Exclude()
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @ApiProperty({ description: 'Fingerprint để nhận diện thẻ duy nhất' })
    fingerprint: string | null;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    @ApiProperty({ description: 'Ngày hết hạn (MM/YY)' })
    expiry_date: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    @ApiProperty({ description: '4 số cuối thẻ (hiển thị)' })
    last4: string | null;

    @ManyToOne(() => UserEntity, (user) => user.payment_informations, {
        nullable: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người dùng', type: () => UserEntity })
    user: UserEntity;

    @OneToMany(() => BookingEntity, (booking) => booking.payment_information)
    @ApiProperty({
        description: 'Danh sách các đơn đặt tour có thông tin thanh toán này',
        type: () => [BookingEntity]
    })
    bookings: BookingEntity[];
}

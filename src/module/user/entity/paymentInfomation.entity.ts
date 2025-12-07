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
        type: 'boolean',
        default: false,
    })
    @ApiProperty({ description: 'Mặc định' })
    is_default: boolean;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Ngày hết hạn' })
    expiry_date: string;

    @Exclude()
    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Số tài khoản (mã hóa)' })
    account_number: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Số tài khoản (hiển thị)' })
    account_number_hint: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên chủ tài khoản' })
    account_holder: string;

    @Exclude()
    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'CCV (mã hóa)' })
    ccv: string;

    @ManyToOne(() => UserEntity, (user) => user.payment_informations, {
        nullable: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Người dùng' })
    user: UserEntity;

    @OneToMany(() => BookingEntity, (booking) => booking.payment_information)
    @ApiProperty({
        description: 'Danh sách các đơn đặt tour có thông tin thanh toán này',
    })
    bookings: BookingEntity[];
}

import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserAuthSessionEntity } from './userAuthSession.entity';
import { RoleEntity } from './role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentInfomationEntity } from './paymentInfomation.entity';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { SupplierEntity } from './supplier.entity';
import { BookingEntity } from '@/module/booking/entity/booking.entity';
@Index(['uuid', 'username'])
@Entity('users')
export class UserEntity extends BaseEntityTimestamp {
    @Exclude()
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    @ApiProperty({ description: 'UUID người dùng' })
    public uuid: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    @ApiProperty({ description: 'Tên tài khoản' })
    public username: string;

    @Exclude()
    @Column()
    password: string;

    @Column()
    @ApiProperty({ description: 'Tên người dùng' })
    public full_name: string;

    @Column({ nullable: true, unique: true })
    @ApiProperty({ description: 'Email người dùng' })
    public email: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Số điện thoại người dùng' })
    public phone: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Ảnh đại diện người dùng' })
    public avatar_url: string;

    @Exclude()
    @Column({
        type: 'smallint',
        default: 1,
        comment: '0: unactive, 1: active',
    })
    public status: number;

    @Exclude()
    @Column({
        type: 'smallint',
        comment: '0: account, 1: facebook, 2: google',
    })
    public login_type: number;

    @Exclude()
    @Column({ nullable: true })
    public reset_password_token: string;

    @Exclude()
    @Column({ nullable: true, type: 'timestamp' })
    public reset_password_token_expires: Date;

    @OneToMany(() => UserAuthSessionEntity, (session) => session.user, {
        cascade: true,
    })
    auth_sessions: UserAuthSessionEntity[];

    @Exclude()
    @ApiProperty({ description: 'Role', type: () => RoleEntity })
    @ManyToOne(() => RoleEntity, (role) => role.users)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: RoleEntity;

    @OneToMany(
        () => PaymentInfomationEntity,
        (payment_information) => payment_information.user,
    )
    @ApiProperty({
        description: 'Thông tin thanh toán',
        type: () => [PaymentInfomationEntity],
    })
    payment_informations: PaymentInfomationEntity[];

    @OneToMany(() => ReviewEntity, (review) => review.user)
    @ApiProperty({ description: 'Đánh giá', type: () => [ReviewEntity] })
    reviews: ReviewEntity[];

    @ManyToOne(() => CountryEntity, (country) => country.users)
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Quốc gia', type: () => CountryEntity })
    country: CountryEntity;

    @ManyToMany(() => TourEntity, (tour) => tour.users_favorites)
    @ApiProperty({
        description: 'Danh sách các tour yêu thích',
        type: () => [TourEntity],
    })
    tours_favorites: TourEntity[];

    @ManyToOne(() => SupplierEntity, (supplier) => supplier.users, {
        nullable: true,
    })
    @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Nhà cung cấp', type: () => SupplierEntity })
    supplier: SupplierEntity | null;

    @OneToMany(() => BookingEntity, (booking) => booking.user)
    @ApiProperty({
        description: 'Danh sách các đơn đặt tour',
        type: () => [BookingEntity],
    })
    bookings: BookingEntity[];

    toJSON() {
        return {
            id: this.id,
            uuid: this.uuid,
            username: this.username,
            full_name: this.full_name,
            email: this.email,
            phone: this.phone,
            avatar_url: this.avatar_url,
            role: this.role ? (typeof this.role.toJSON === 'function' ? this.role.toJSON() : this.role) : null,
            supplier: this.supplier,
        };
    }
}

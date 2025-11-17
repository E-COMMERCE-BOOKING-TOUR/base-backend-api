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
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentInfomationEntity } from './paymentInfomation.entity';
import { ArticleEntity } from '@/module/article/entity/article.entity';
import { ArticleCommentEntity } from '@/module/article/entity/articleComment.entity';
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

    @OneToMany(() => UserAuthSessionEntity, (session) => session.user, {
        cascade: true,
    })
    auth_sessions: UserAuthSessionEntity[];

    @Exclude()
    @ApiProperty({ description: 'Role' })
    @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: RoleEntity;

    @OneToMany(() => PaymentInfomationEntity, (payment_information) => payment_information.user)
    @ApiProperty({ description: 'Thông tin thanh toán' })
    payment_informations: PaymentInfomationEntity[];

    @OneToMany(() => ArticleEntity, (article) => article.user)
    @ApiProperty({ description: 'Bài viết' })
    articles: ArticleEntity[];

    @OneToMany(() => ArticleCommentEntity, (comment) => comment.user)
    @ApiProperty({ description: 'Bình luận bài viết' })
    comments: ArticleCommentEntity[];

    @OneToMany(() => ReviewEntity, (review) => review.user)
    @ApiProperty({ description: 'Đánh giá' })
    reviews: ReviewEntity[];

    @ManyToOne(() => CountryEntity, (country) => country.users)
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Quốc gia' })
    country: CountryEntity;

    @ManyToMany(() => TourEntity, (tour) => tour.users_favorites)
    @ApiProperty({ description: 'Danh sách các tour yêu thích' })
    tours_favorites: TourEntity[];

    @ManyToMany(() => ArticleEntity, (article) => article.users_like)
    @ApiProperty({ description: 'Danh sách các bài viết thích' })
    articles_like: ArticleEntity[];

    @ManyToOne(() => SupplierEntity, (supplier) => supplier.users, { nullable: true })
    @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Nhà cung cấp' })
    supplier: SupplierEntity | null;

    @OneToMany(() => BookingEntity, (booking) => booking.user)
    @ApiProperty({ description: 'Danh sách các đơn đặt tour' })
    bookings: BookingEntity[];
    
    toJSON() {
        return {
            uuid: this.uuid,
            username: this.username,
            full_name: this.full_name,
            email: this.email,
            role: this.role,
        };
    }
}

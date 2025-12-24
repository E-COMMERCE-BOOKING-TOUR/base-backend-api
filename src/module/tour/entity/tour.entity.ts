import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import {
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { TourCategoryEntity } from './tourCategory.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import { TourImageEntity } from './tourImage.entity';
import { TourVariantEntity } from './tourVariant.entity';
import { TourStatus } from '../dto/tour.dto';

@Entity('tours')
export class TourEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên tour' })
    title: string;

    @Column({
        type: 'mediumtext',
    })
    @ApiProperty({ description: 'Mô tả tour' })
    description: string;

    @Column({
        type: 'text',
    })
    @ApiProperty({ description: 'Tóm tắt tour' })
    summary: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'URL bản đồ tour' })
    map_url: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
    })
    @ApiProperty({ description: 'Slug tour' })
    slug: string;

    @Index()
    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Địa chỉ tour (số nhà/tên đường)' })
    address: string;

    @Column({
        type: 'float',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Điểm đánh giá tour' })
    score_rating: number;

    @Column({
        type: 'float',
        default: 0,
    })
    @ApiProperty({ description: 'Thuế tour (%)' })
    tax: number;

    @Index()
    @Column({
        type: 'bool',
        default: false,
    })
    @ApiProperty({ description: 'Hiển thị' })
    is_visible: boolean;

    @Column({
        type: 'datetime',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Ngày công bố tour' })
    published_at: Date;

    @Index()
    @Column({
        type: 'enum',
        enum: TourStatus,
        default: TourStatus.inactive,
    })
    @ApiProperty({ description: 'Trạng thái tour', enum: TourStatus })
    status: TourStatus;

    @Column({
        type: 'smallint',
        nullable: true,
    })
    @ApiProperty({ description: 'Thời gian tour (giờ)' })
    duration_hours: number;

    @Column({
        type: 'smallint',
        nullable: true,
    })
    @ApiProperty({ description: 'Thời gian tour (ngày)' })
    duration_days: number;

    @Column({
        type: 'smallint',
        default: 1,
    })
    @ApiProperty({ description: 'Số lượng người tối thiểu' })
    min_pax: number;

    @Column({
        type: 'smallint',
        nullable: true,
        default: null,
    })
    @ApiProperty({
        description: 'Số lượng người tối đa (null: không giới hạn)',
    })
    max_pax: number;

    @Index()
    @ManyToOne(() => CountryEntity, (country) => country.tours)
    @JoinColumn({ name: 'country_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Quốc gia', type: () => CountryEntity })
    country: CountryEntity;

    @Index()
    @ManyToOne(() => DivisionEntity, (division) => division.tours)
    @JoinColumn({ name: 'division_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Phân cấp', type: () => DivisionEntity })
    division: DivisionEntity;

    @ManyToOne(() => CurrencyEntity, (currency) => currency.tours)
    @JoinColumn({ name: 'currency_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tiền tệ', type: () => CurrencyEntity })
    currency: CurrencyEntity;

    @ManyToMany(() => UserEntity)
    @JoinTable({
        name: 'tour_users_favorites',
        joinColumn: { name: 'tour_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    @ApiProperty({
        type: () => [UserEntity],
        description: 'Danh sách các người dùng yêu thích tour',
    })
    users_favorites: UserEntity[];

    @OneToMany(() => ReviewEntity, (review) => review.tour)
    @ApiProperty({
        description: 'Danh sách các đánh giá',
        type: () => [ReviewEntity],
    })
    reviews: ReviewEntity[];

    @ManyToMany(() => TourCategoryEntity)
    @JoinTable({
        name: 'tour_tour_categories',
        joinColumn: { name: 'tour_id', referencedColumnName: 'id' },
        inverseJoinColumn: {
            name: 'tour_category_id',
            referencedColumnName: 'id',
        },
    })
    @ApiProperty({
        type: () => [TourCategoryEntity],
        description: 'Danh sách các danh mục tour',
    })
    tour_categories: TourCategoryEntity[];

    @Index()
    @ManyToOne(() => SupplierEntity, (supplier) => supplier.tours, {
        nullable: false,
    })
    @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Nhà cung cấp', type: () => SupplierEntity })
    supplier: SupplierEntity;

    @OneToMany(() => TourImageEntity, (image) => image.tour)
    @ApiProperty({
        description: 'Danh sách các ảnh tour',
        type: () => [TourImageEntity],
    })
    images: TourImageEntity[];

    @OneToMany(() => TourVariantEntity, (variant) => variant.tour)
    @ApiProperty({
        description: 'Danh sách các biến thể tour',
        type: () => [TourVariantEntity],
    })
    variants: TourVariantEntity[];

    @Column({
        type: 'varchar',
        length: 1000,
        nullable: true,
    })
    @ApiProperty({ description: 'Điểm hẹn' })
    meeting_point: string;

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    @ApiProperty({ description: 'Bao gồm (mảng chuỗi)' })
    included: string[];

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    @ApiProperty({ description: 'Không bao gồm (mảng chuỗi)' })
    not_included: string[];

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    @ApiProperty({
        description: 'Điểm nổi bật (highlights/activity)',
        example: { title: 'Highlights', items: ['...'] },
    })
    highlights: { title: string; items: string[] };

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    @ApiProperty({ description: 'Ngông ngữ hỗ trợ' })
    languages: string[];

    @Column({
        type: 'float',
        nullable: true,
        default: 0,
    })
    @ApiProperty({ description: 'Điểm đánh giá nhân viên' })
    staff_score: number;

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    @ApiProperty({
        description: 'Nhận xét tiêu biểu (testimonial)',
        example: { name: '...', country: '...', text: '...' },
    })
    testimonial: { name: string; country: string; text: string };

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    @ApiProperty({ description: 'Ảnh xem trước bản đồ' })
    map_preview: string;
}

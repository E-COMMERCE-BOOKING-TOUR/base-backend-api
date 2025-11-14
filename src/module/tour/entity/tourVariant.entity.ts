import { BaseEntityTimestamp } from "@/common/entity/BaseEntityTimestamp";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TourEntity } from "./tour.entity";
import { CurrencyEntity } from "@/common/entity/currency.entity";
import { TourSessionEntity } from "./tourSession.entity";
import { TourPolicyEntity } from "./tourPolicy.entity";
import { TourVariantPaxTypePriceEntity } from "./tourVariantPaxTypePrice.entity";
import { TourPriceRuleEntity } from "./tourPriceRule.entity";
import { BookingItemEntity } from "@/module/booking/entity/bookingItem.entity";

@Entity('tour_variants')
export class TourVariantEntity extends BaseEntityTimestamp {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên biến thể tour' })
    name: string;

    @Column({
        type: 'tinyint',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số thứ tự' })
    sort_no: number;

    @Column({
        type: 'smallint',
        default: 1,
    })
    @ApiProperty({ description: 'Số lượng người tối thiểu' })
    min_pax_per_booking: number;

    @Column({
        type: 'int',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Số lượng người tối đa trong một slot' })
    capacity_per_slot: number | null;

    @Column({
        type: 'bool',
        default: false,
    })
    @ApiProperty({ description: 'Thuế đã được bao gồm' })
    tax_included: boolean;

    @Column({
        type: 'int',
        default: 24,
    })
    @ApiProperty({ description: 'Thời gian chặn trước khởi hành' })
    cutoff_hours: number;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    @ApiProperty({ description: 'Trạng thái biến thể tour' })
    status: string;

    @ManyToOne(() => TourEntity, (tour) => tour.variants, { nullable: false })
    @JoinColumn({ name: 'tour_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tour' })
    tour: TourEntity;

    @ManyToOne(() => CurrencyEntity, (currency) => currency.tour_variants, { nullable: false })
    @JoinColumn({ name: 'currency_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Tiền tệ biến thể tour' })
    currency: CurrencyEntity;

    @OneToMany(() => TourSessionEntity, (session) => session.tour_variant)
    @ApiProperty({ description: 'Danh sách các lịch chạy của biến thể tour' })
    tour_sessions: TourSessionEntity[];

    @OneToMany(() => TourPolicyEntity, (tour_policy) => tour_policy.tour_variant)
    @ApiProperty({ description: 'Chính sách hủy/fee của biến thể tour' })
    tour_policy: TourPolicyEntity;

    @OneToMany(() => TourVariantPaxTypePriceEntity, (tour_variant_pax_type_price) => tour_variant_pax_type_price.tour_variant)
    @ApiProperty({ description: 'Giá áp theo rule cho loại khách' })
    tour_variant_pax_type_prices: TourVariantPaxTypePriceEntity[];

    @OneToMany(() => TourPriceRuleEntity, (tour_price_rule) => tour_price_rule.tour_variant)
    @ApiProperty({ description: 'Quy tắc giá theo mùa/ngày trong tuần' })
    tour_price_rules: TourPriceRuleEntity[];

    @OneToMany(() => BookingItemEntity, (booking_item) => booking_item.variant)
    @ApiProperty({ description: 'Danh sách các mục đặt tour có biến thể tour này' })
    booking_items: BookingItemEntity[];
}
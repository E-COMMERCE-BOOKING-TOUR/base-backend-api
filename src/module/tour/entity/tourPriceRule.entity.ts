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
import { TourVariantEntity } from './tourVariant.entity';
import { TourRulePaxTypePriceEntity } from './tourRulePaxTypePrice.entity';

@Entity({ name: 'tour_price_rules' })
export class TourPriceRuleEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'date',
    })
    @ApiProperty({ description: 'Ngày bắt đầu hiệu lực rule' })
    start_date: Date;

    @Column({
        type: 'date',
    })
    @ApiProperty({ description: 'Ngày kết thúc hiệu lực rule' })
    end_date: Date;

    @Column({
        type: 'tinyint',
    })
    @ApiProperty({
        description: 'Bitmask 7-bit (CN..T7); 127 = áp dụng mọi ngày',
    })
    weekday_mask: number;

    @Column({
        type: 'enum',
        enum: ['absolute', 'delta'],
        default: 'absolute',
    })
    @ApiProperty({
        description: 'absolute: ghi đè; delta: cộng/trừ so với base',
    })
    price_type: 'absolute' | 'delta';

    @Column({
        type: 'int',
    })
    @ApiProperty({ description: 'Độ ưu tiên (cao hơn áp sau để ghi đè)' })
    priority: number;

    @ManyToOne(
        () => TourVariantEntity,
        (tour_variant) => tour_variant.tour_price_rules,
        { nullable: false, onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'tour_variant_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Biến thể tour' })
    tour_variant: TourVariantEntity;

    @OneToMany(
        () => TourRulePaxTypePriceEntity,
        (tour_rule_pax_type_price) => tour_rule_pax_type_price.tour_price_rule,
    )
    @ApiProperty({ description: 'Giá áp theo rule cho loại khách' })
    tour_rule_pax_type_prices: TourRulePaxTypePriceEntity[];
}

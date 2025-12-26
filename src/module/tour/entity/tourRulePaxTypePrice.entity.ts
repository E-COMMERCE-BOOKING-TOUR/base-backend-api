import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TourPaxTypeEntity } from './tourPaxType.entity';
import { TourPriceRuleEntity } from './tourPriceRule.entity';

@Entity('tour_rule_pax_type_prices')
export class TourRulePaxTypePriceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'float',
    })
    @ApiProperty({ description: 'Giá áp theo rule cho loại khách' })
    price: number;

    @ManyToOne(
        () => TourPriceRuleEntity,
        (tour_price_rule) => tour_price_rule.tour_rule_pax_type_prices,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'tour_price_rule_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Quy tắc giá theo mùa/ngày trong tuần',
        type: () => TourPriceRuleEntity,
    })
    tour_price_rule: TourPriceRuleEntity;

    @ManyToOne(
        () => TourPaxTypeEntity,
        (pax_type) => pax_type.tour_variant_pax_type_prices,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'pax_type_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Loại khách', type: () => TourPaxTypeEntity })
    pax_type: TourPaxTypeEntity;
}

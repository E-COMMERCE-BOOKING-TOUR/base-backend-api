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
import { TourPolicyRuleEntity } from './tourPolicyRule.entity';
import { TourVariantEntity } from './tourVariant.entity';

@Entity('tour_policies')
export class TourPolicyEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tên chính sách' })
    name: string;

    @OneToMany(
        () => TourPolicyRuleEntity,
        (tour_policy_rule) => tour_policy_rule.tour_policy,
    )
    @ApiProperty({ description: 'Danh sách các bậc phí hủy theo mốc giờ' })
    tour_policy_rules: TourPolicyRuleEntity[];

    @ManyToOne(
        () => TourVariantEntity,
        (tour_variant) => tour_variant.tour_policy,
        { nullable: false },
    )
    @JoinColumn({ name: 'tour_variant_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Biến thể tour' })
    tour_variant: TourVariantEntity;
}

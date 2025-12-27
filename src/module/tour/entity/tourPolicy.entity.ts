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
import { SupplierEntity } from '@/module/user/entity/supplier.entity';

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
    @ApiProperty({
        description: 'Danh sách các bậc phí hủy theo mốc giờ',
        type: () => [TourPolicyRuleEntity],
    })
    tour_policy_rules: TourPolicyRuleEntity[];

    @Column()
    @ApiProperty({ description: 'ID nhà cung cấp' })
    supplier_id: number;

    @ManyToOne(
        () => SupplierEntity,
        (supplier) => supplier.tour_policies,
        { nullable: false, onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Nhà cung cấp sở hữu chính sách',
        type: () => SupplierEntity,
    })
    supplier: SupplierEntity;
}

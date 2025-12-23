import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TourPolicyEntity } from './tourPolicy.entity';

@Entity('tour_policy_rules')
export class TourPolicyRuleEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    @ApiProperty({
        description:
            'Nếu hủy trước X giờ so với start thì áp fee_pct tương ứng',
    })
    before_hours: number;

    @Column({
        type: 'tinyint',
    })
    @ApiProperty({
        description: 'Tỷ lệ phí hủy (%) áp cho khoảng thời gian này',
    })
    fee_pct: number;

    @Column({
        type: 'smallint',
    })
    @ApiProperty({ description: 'Thứ tự áp rule (từ lớn trước đến nhỏ sau)' })
    sort_no: number;

    @ManyToOne(
        () => TourPolicyEntity,
        (tour_policy) => tour_policy.tour_policy_rules,
        { nullable: false },
    )
    @JoinColumn({ name: 'tour_policy_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Chính sách hủy/fee', type: () => TourPolicyEntity })
    tour_policy: TourPolicyEntity;
}

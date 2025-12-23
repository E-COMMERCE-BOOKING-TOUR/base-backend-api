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
import { TourInventoryHoldEntity } from './tourInventoryHold.entity';
import { BookingItemEntity } from '@/module/booking/entity/bookingItem.entity';

@Entity('tour_sessions')
export class TourSessionEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'date',
    })
    @ApiProperty({
        description: 'Ngày chạy (local date theo timezone business)',
    })
    session_date: Date;

    @Column({
        type: 'time',
        nullable: true,
        default: '00:00:00',
    })
    @ApiProperty({ description: 'Giờ bắt đầu (00:00:00 nếu all-day)' })
    start_time: Date;

    @Column({
        type: 'time',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Giờ kết thúc (nullable)' })
    end_time: Date;

    @Column({
        type: 'int',
        nullable: true,
        default: null,
    })
    @ApiProperty({
        description:
            'Sức chứa cho slot cụ thể (NULL: dùng capacity_per_slot của variant)',
    })
    capacity: number;

    @Column({
        type: 'enum',
        enum: ['open', 'closed', 'full', 'cancelled'],
        default: 'open',
    })
    @ApiProperty({ description: 'Trạng thái chạy slot' })
    status: string;

    @ManyToOne(
        () => TourVariantEntity,
        (tour_variant) => tour_variant.tour_sessions,
        { nullable: false, onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'tour_variant_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Lịch chạy của biến thể tour', type: () => TourVariantEntity })
    tour_variant: TourVariantEntity;

    @OneToMany(
        () => TourInventoryHoldEntity,
        (tour_inventory_hold) => tour_inventory_hold.tour_session,
    )
    @ApiProperty({ description: 'Danh sách các giữ chỗ của slot', type: () => [TourInventoryHoldEntity] })
    tour_inventory_holds: TourInventoryHoldEntity[];

    @OneToMany(
        () => BookingItemEntity,
        (booking_item) => booking_item.tour_session,
    )
    @ApiProperty({ description: 'Danh sách các mục đặt tour có lịch chạy này', type: () => [BookingItemEntity] })
    booking_items: BookingItemEntity[];
}

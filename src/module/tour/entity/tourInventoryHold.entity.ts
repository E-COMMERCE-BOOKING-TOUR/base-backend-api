import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TourSessionEntity } from './tourSession.entity';
import { BookingEntity } from '@/module/booking/entity/booking.entity';

@Entity('tour_inventory_holds')
export class TourInventoryHoldEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    @ApiProperty({ description: 'Số lượng khách đặt' })
    quantity: number;

    @Column({
        type: 'datetime',
        nullable: true,
        default: null,
    })
    @ApiProperty({ description: 'Thời điểm hết hạn' })
    expires_at: Date | null;

    @ManyToOne(
        () => TourSessionEntity,
        (tour_session) => tour_session.tour_inventory_holds,
        { nullable: false },
    )
    @JoinColumn({ name: 'tour_session_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Lịch chạy của biến thể tour',
        type: () => TourSessionEntity,
    })
    tour_session: TourSessionEntity;

    @OneToOne(() => BookingEntity, (booking) => booking.tour_inventory_hold)
    @JoinColumn({ name: 'booking_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Đơn đặt tour (nullable nếu giữ chỗ chưa được đặt)',
        type: () => BookingEntity,
    })
    booking: BookingEntity | null;
}

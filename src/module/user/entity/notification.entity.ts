import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class NotificationEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Tiêu đề thông báo' })
    title: string;

    @Column({
        type: 'text',
    })
    @ApiProperty({ description: 'Nội dung thông báo' })
    description: string;

    @Column({
        type: 'varchar',
        length: 20,
    })
    @ApiProperty({ description: 'Loại thông báo' })
    type: string;

    @Column({
        type: 'boolean',
        default: false,
    })
    @ApiProperty({ description: 'Thông báo lỗi' })
    is_error: boolean;

    @Column({
        type: 'boolean',
        default: false,
    })
    @ApiProperty({ description: 'Thông báo có liên quan đến người dùng' })
    is_user: boolean;

    @ManyToMany(() => UserEntity)
    @JoinTable({
        name: 'notification_users',
        joinColumn: { name: 'notification_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    @ApiProperty({
        type: () => [UserEntity],
        description: 'Danh sách các người dùng',
    })
    users: UserEntity[];
}

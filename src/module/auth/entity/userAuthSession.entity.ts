import { UserEntity } from './user.entity';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('user_auth_sessions')
@Index('idx_user_uid', ['user_uid'])
@Index('idx_created_at', ['created_at'])
export class UserAuthSessionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
    })
    user_uid: string;

    @Column({
        type: 'text',
    })
    access_token: string;

    @Column({
        type: 'text',
    })
    refresh_token: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => UserEntity, (user) => user.auth_sessions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_uid', referencedColumnName: 'uuid' })
    user: UserEntity;
}

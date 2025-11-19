import { Exclude } from 'class-transformer';
import {
    BaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntityTimestamp extends BaseEntity {
    @Exclude()
    @CreateDateColumn({
        type: 'datetime',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        select: true,
    })
    public created_at!: Date;

    @Exclude()
    @UpdateDateColumn({
        type: 'datetime',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        select: true,
    })
    public updated_at!: Date;

    @Exclude()
    @DeleteDateColumn({
        type: 'datetime',
        precision: 6,
        nullable: true,
        select: true,
    })
    public deleted_at!: Date;
}

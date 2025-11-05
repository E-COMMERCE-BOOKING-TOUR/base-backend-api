import { Exclude } from 'class-transformer';
import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntityTimestamp extends BaseEntity {
  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
  public created_at!: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    select: true,
  })
  public updated_at!: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
    select: true,
  })
  public deleted_at!: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @ApiProperty({ description: 'Tên permission' })
  permission_name: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  @ApiProperty({ description: 'Mô tả permission' })
  description: string;
}

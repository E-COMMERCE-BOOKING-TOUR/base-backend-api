import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { UserAuthSessionEntity } from './userAuthSession.entity';
import { RoleEntity } from './role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Index(['uuid', 'username'])
@Entity('users')
export class UserEntity extends BaseEntityTimestamp {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid', { unique: true })
  @ApiProperty({ description: 'UUID người dùng' })
  public uuid: string;

  @PrimaryColumn()
  @ApiProperty({ description: 'Tên tài khoản' })
  public username: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  @ApiProperty({ description: 'Tên người dùng' })
  public full_name: string;

  @Column({ nullable: true, unique: true })
  @ApiProperty({ description: 'Email người dùng' })
  public email: string;

  @Exclude()
  @Column({
    type: 'smallint',
    default: 1,
    comment: '0: unactive, 1: active',
  })
  public status: number;

  @Exclude()
  @Column({
    type: 'smallint',
    comment: '0: account, 1: facebook, 2: google',
  })
  public login_type: number;

  @OneToMany(() => UserAuthSessionEntity, (session) => session.user, {
    cascade: true,
  })
  auth_sessions: UserAuthSessionEntity[];

  @Exclude()
  @ApiProperty({ description: 'Role' })
  @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleEntity;

  toJSON() {
    return {
      uuid: this.uuid,
      username: this.username,
      full_name: this.full_name,
      email: this.email,
      role: this.role,
    };
  }
}

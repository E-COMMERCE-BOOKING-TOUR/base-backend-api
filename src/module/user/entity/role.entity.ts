import { BaseEntityTimestamp } from '@/common/entity/BaseEntityTimestamp';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('roles')
export class RoleEntity extends BaseEntityTimestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
    })
    @ApiProperty({ description: 'Tên role: ...' })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    @ApiProperty({ description: 'Mô tả role' })
    desciption: string;

    @OneToMany(() => UserEntity, (user) => user.role)
    @ApiProperty({
        description: 'Danh sách các người dùng',
        type: () => [UserEntity],
    })
    users: UserEntity[];

    @ManyToMany(() => PermissionEntity)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    })
    @ApiProperty({
        type: () => [PermissionEntity],
        description: 'Danh sách các phân quyền',
    })
    permissions: PermissionEntity[];
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            desciption: this.desciption,
            permissions: (this.permissions || []).map(p =>
                typeof p === 'string' ? p : p.permission_name
            ),
        };
    }
}

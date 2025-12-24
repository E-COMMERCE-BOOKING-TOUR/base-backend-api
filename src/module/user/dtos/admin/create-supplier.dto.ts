import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
} from 'class-validator';

export enum SupplierStatus {
    active = 'active',
    inactive = 'inactive',
}

export class CreateSupplierDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tên nhà cung cấp' })
    name: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'Email nhà cung cấp' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Số điện thoại nhà cung cấp' })
    phone: string;

    @IsOptional()
    @IsEnum(SupplierStatus)
    @ApiProperty({
        description: 'Trạng thái nhà cung cấp',
        enum: SupplierStatus,
        default: SupplierStatus.inactive,
        required: false,
    })
    status?: SupplierStatus;
}

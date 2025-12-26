import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';

export enum SupplierStatus {
    active = 'active',
    inactive = 'inactive',
}

export class UpdateSupplierDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Tên nhà cung cấp', required: false })
    name?: string;

    @IsOptional()
    @IsEmail()
    @ApiProperty({ description: 'Email nhà cung cấp', required: false })
    email?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Số điện thoại nhà cung cấp', required: false })
    phone?: string;

    @IsOptional()
    @IsEnum(SupplierStatus)
    @ApiProperty({
        description: 'Trạng thái nhà cung cấp',
        enum: SupplierStatus,
        required: false,
    })
    status?: SupplierStatus;
}

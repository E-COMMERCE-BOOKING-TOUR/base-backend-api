import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAdminDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tên tài khoản' })
    username: string;

    @MinLength(8)
    @IsNotEmpty()
    @ApiProperty({ description: 'Mật khẩu người dùng' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tên người dùng' })
    full_name: string;

    @IsOptional()
    @IsEmail()
    @ApiProperty({ description: 'Email người dùng', required: false })
    email?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Số điện thoại người dùng', required: false })
    phone?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({
        description: 'Trạng thái (0: không hoạt động, 1: hoạt động)',
        required: false,
        default: 1,
    })
    status?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({
        description: 'Kiểu đăng nhập (0: account, 1: facebook, 2: google)',
        required: false,
        default: 0,
    })
    login_type?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({ description: 'ID quốc gia', required: false })
    country_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({ description: 'ID nhà cung cấp', required: false })
    supplier_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({ description: 'ID vai trò', required: false })
    role_id?: number;
}

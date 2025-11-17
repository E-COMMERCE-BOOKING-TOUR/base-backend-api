import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
    IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserStatus {
    unactive = 0,
    active = 1,
}

export enum LoginType {
    account = 0,
    facebook = 1,
    google = 2,
}

@ApiSchema({ name: 'CreateUserRequest' })
export class UserDTO {
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]+$/)
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
        description: 'Trạng thái',
        enum: UserStatus,
        required: false,
    })
    status?: UserStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({
        description: 'Kiểu đăng nhập',
        enum: LoginType,
        required: false,
    })
    login_type?: LoginType;

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

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    @MinLength(5)
    @Matches(/^[a-zA-Z0-9]+$/)
    @ApiProperty({ description: 'Tên tài khoản', required: false })
    username?: string;

    @IsOptional()
    @MinLength(8)
    @ApiProperty({ description: 'Mật khẩu người dùng', required: false })
    password?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Tên người dùng', required: false })
    full_name?: string;

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
        description: 'Trạng thái',
        enum: UserStatus,
        required: false,
    })
    status?: UserStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @ApiProperty({
        description: 'Kiểu đăng nhập',
        enum: LoginType,
        required: false,
    })
    login_type?: LoginType;

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

export class UserSummaryDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty()
    uuid: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    full_name: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ enum: UserStatus })
    status: UserStatus;

    @ApiProperty({ enum: LoginType })
    login_type: LoginType;

    @ApiProperty({ required: false })
    country_id?: number;

    @ApiProperty({ required: false })
    supplier_id?: number | null;

    @ApiProperty({ required: false })
    role_id?: number;

    constructor(partial: Partial<UserSummaryDTO>) {
        Object.assign(this, partial);
    }
}

export class UserDetailDTO extends UserSummaryDTO {
    @ApiProperty({ type: [Number], required: false })
    tour_favorite_ids?: number[];

    @ApiProperty({ type: [Number], required: false })
    article_like_ids?: number[];

    constructor(partial: Partial<UserDetailDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class LoginDTO {
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]+$/, {
        message:
            'Username chỉ được chứa chữ cái và số, không được có dấu cách hoặc ký tự đặc biệt.',
    })
    @ApiProperty({
        description: 'Tên tài khoản người dùng',
        example: 'abcdef123',
    })
    username: string;

    @MinLength(8)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Mật khẩu người dùng',
        example: '123456789',
    })
    password: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'ID khách hàng (nếu có)', required: false })
    guest_id?: string;
}

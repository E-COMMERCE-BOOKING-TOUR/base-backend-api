import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

@ApiSchema({ name: 'CreateCatRequest' })
export class RegisterDTO {
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
    @IsNotEmpty()
    @ApiProperty({ description: 'Họ và tên', example: 'Nguyen Van A' })
    full_name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Email', example: 'test@example.com' })
    email: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Số điện thoại', example: '0123456789' })
    phone?: string;
}

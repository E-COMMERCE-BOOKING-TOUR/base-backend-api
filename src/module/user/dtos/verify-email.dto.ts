import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDTO {
    @ApiProperty({
        description: 'Token xác nhận email được gửi qua email',
        example: 'abc123def456...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Token không được để trống!' })
    token: string;
}

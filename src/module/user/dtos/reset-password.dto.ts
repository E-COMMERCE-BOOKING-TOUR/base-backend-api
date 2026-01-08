import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDTO {
    @ApiProperty({ description: 'Reset Token', required: true })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ description: 'New Password', required: true, minLength: 5 })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password: string;
}

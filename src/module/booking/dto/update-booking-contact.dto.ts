import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBookingContactDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @ApiProperty({ description: 'Tên người liên hệ', example: 'Nguyễn Văn A' })
    contact_name: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'Email người liên hệ', example: 'example@email.com' })
    contact_email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    @ApiProperty({ description: 'SĐT người đặt tour', example: '0901234567' })
    contact_phone: string;
}

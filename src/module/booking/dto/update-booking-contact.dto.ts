import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class PassengerDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Họ tên hành khách', example: 'Nguyen Van B' })
    full_name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'SĐT hành khách', example: '0901234567' })
    phone_number?: string;
}

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PassengerDto)
    @ApiProperty({ description: 'Danh sách hành khách', type: [PassengerDto] })
    passengers: PassengerDto[];
}

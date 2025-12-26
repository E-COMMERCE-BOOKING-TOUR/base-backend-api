import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tên permission' })
    permission_name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Mô tả permission' })
    description: string;
}

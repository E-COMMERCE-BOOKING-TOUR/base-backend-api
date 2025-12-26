import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Tên permission', required: false })
    permission_name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Mô tả permission', required: false })
    description?: string;
}

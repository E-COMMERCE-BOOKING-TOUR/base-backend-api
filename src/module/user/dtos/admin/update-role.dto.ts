import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoleDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Tên role', required: false })
    name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Mô tả role', required: false })
    desciption?: string;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsInt({ each: true })
    @ApiProperty({
        description: 'Danh sách ID permission',
        type: [Number],
        required: false,
    })
    permission_ids?: number[];
}

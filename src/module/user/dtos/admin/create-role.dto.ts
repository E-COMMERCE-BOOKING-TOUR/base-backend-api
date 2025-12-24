import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Tên role' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Mô tả role' })
    desciption: string;

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

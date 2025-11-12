import { ApiProperty } from '@nestjs/swagger';

export * from './register.dto';
export * from './login.dto';

export class TokenDTO {
    @ApiProperty({ description: 'Access token', example: 'eaaa' })
    access_token: string;
    @ApiProperty({ description: 'Refresh token', example: 'eaaa' })
    refresh_token: string;

    constructor(partial: Partial<object>) {
        Object.assign(this, partial);
    }
}

export class MessageResponseDTO {
    @ApiProperty({
        description: 'Trạng thái lỗi',
        required: true,
        example: false,
    })
    error: boolean;
    @ApiProperty({ description: 'Thông báo về kết quả', required: true })
    message: string;

    constructor(partial: Partial<object>) {
        Object.assign(this, partial);
    }
}

export class AuthResponseDTO extends MessageResponseDTO {
    @ApiProperty({ type: TokenDTO, description: 'Thông tin về token' })
    token: TokenDTO;

    constructor(partial: Partial<AuthResponseDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}

export class UnauthorizedResponseDto {
    @ApiProperty({ example: 401 })
    status: number;

    @ApiProperty({ example: true })
    error: boolean;

    @ApiProperty({ example: '......' })
    message: string;

    @ApiProperty({ example: '2024-10-30T15:00:00.000Z' })
    timestamp: string;

    @ApiProperty({ example: '.....' })
    path: string;
}

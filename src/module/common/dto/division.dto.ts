import { ApiProperty } from '@nestjs/swagger';

export class UserDivisionTrendingDTO {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Hà Nội' })
    title: string;

    @ApiProperty({ example: '/assets/images/hanoi.jpg' })
    image: string;

    @ApiProperty({ example: 14 })
    toursCount: number;

    @ApiProperty({ example: '🇻🇳', required: false })
    flag?: string;

    constructor(partial: Partial<UserDivisionTrendingDTO>) {
        Object.assign(this, partial);
    }
}

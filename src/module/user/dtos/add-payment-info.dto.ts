import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPaymentInfoDto {
    @ApiProperty({ description: 'Stripe Token ID or PaymentMethod ID' })
    @IsString()
    @IsNotEmpty()
    token: string;
}

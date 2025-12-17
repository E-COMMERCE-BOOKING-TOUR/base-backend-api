import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateBookingPaymentDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Tên phương thức thanh toán',
        example: 'Credit Card',
    })
    payment_method: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID của phương thức thanh toán',
        example: 1,
    })
    booking_payment_id: number;
}

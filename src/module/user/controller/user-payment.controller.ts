import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';
import { UserPaymentService } from '../service/user-payment.service';
import { AddPaymentInfoDto } from '../dtos/add-payment-info.dto';
import { JwtExceptionFilter } from '@/common/exceptions/jwt.exception';

@ApiTags('User Payment')
@Controller('user/payment')
export class UserPaymentController {
    constructor(private readonly userPaymentService: UserPaymentService) { }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('card')
    @ApiResponse({ status: 201, description: 'Add payment card success' })
    async addPaymentCard(@User() user: UserEntity, @Body() dto: AddPaymentInfoDto) {
        return await this.userPaymentService.addPaymentCard(user, dto.token);
    }
}

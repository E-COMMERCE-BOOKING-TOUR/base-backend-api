import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminCurrencyService } from '../service/admin-currency.service';

@ApiTags('User Currency')
@Controller('user/currency')
export class UserCurrencyController {
    constructor(private readonly currencyService: AdminCurrencyService) { }

    @Get('all')
    @ApiOperation({ summary: 'Get all available currencies' })
    @ApiResponse({
        status: 200,
        description: 'List of all currencies',
    })
    async getAll() {
        return this.currencyService.getAll();
    }
}

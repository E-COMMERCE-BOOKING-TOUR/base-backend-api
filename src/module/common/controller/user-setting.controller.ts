import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminSettingService } from '../service/admin-setting.service';

@ApiTags('Settings')
@Controller('settings')
export class UserSettingController {
    constructor(private readonly adminSettingService: AdminSettingService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy cấu hình site settings công khai' })
    async getSettings() {
        return this.adminSettingService.getSettings();
    }
}

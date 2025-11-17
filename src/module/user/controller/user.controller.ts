import { UserService } from '../service/user.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    UserDTO,
    UpdateUserDTO,
    UserSummaryDTO,
    UserDetailDTO,
} from '../dtos/user.dto';
import { UnauthorizedResponseDto } from '../dtos';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('getAll')
    @ApiResponse({ status: 201, type: [UserSummaryDTO] })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getAll() {
        return await this.userService.getAllUsers();
    }

    @Post('getById')
    @ApiResponse({ status: 201, type: UserDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async getById(@Body() id: number) {
        return await this.userService.getUserById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: UserDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async create(@Body() dto: UserDTO) {
        return await this.userService.createUser(dto);
    }

    @Post('update')
    @ApiResponse({ status: 201, type: UserDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async update(@Body() payload: { id: number; data: UpdateUserDTO }) {
        return await this.userService.updateUser(payload.id, payload.data);
    }

    @Post('remove')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Body() id: number) {
        return await this.userService.removeUser(id);
    }
}

import { UserService } from '../service/user.service';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
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
    @ApiBody({
        schema: {
            type: 'object',
            properties: { id: { type: 'number', example: 1 } },
        },
    })
    async getById(@Body('id') id: number) {
        return await this.userService.getUserById(id);
    }

    @Post('create')
    @ApiResponse({ status: 201, type: UserDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'password123' },
                name: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '1234567890' },
            },
        },
    })
    async create(@Body() dto: UserDTO) {
        return await this.userService.createUser(dto);
    }

    @Post('update/:id')
    @ApiResponse({ status: 201, type: UserDetailDTO })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', example: 'user@example.com' },
                        password: { type: 'string', example: 'password123' },
                        username: { type: 'string', example: 'John Doe' },
                        phone: { type: 'string', example: '1234567890' },
                    },
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body('data') data: UpdateUserDTO) {
        return await this.userService.updateUser(id, data);
    }

    @Delete('remove/:id')
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    @ApiParam({ name: 'id', type: Number, example: 17 })
    @ApiResponse({ status: 201, type: Boolean })
    @ApiResponse({ status: 401, type: UnauthorizedResponseDto })
    async remove(@Param('id') id: number) {
        return await this.userService.removeUser(id);
    }
}

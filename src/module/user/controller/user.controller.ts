import { UserService } from '../service/user.service';
import { Body, Controller, Delete, Get, Param, Post, UseGuards, UseFilters } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import {
    UserDTO,
    UpdateUserDTO,
    UserSummaryDTO,
    UserDetailDTO,
    ChangePasswordDTO,
    UpdateProfileDTO,
} from '../dtos/user.dto';
import { UnauthorizedResponseDto } from '../dtos';
import { AuthGuard } from "@nestjs/passport";
import { JwtExceptionFilter } from "@/common/exceptions/jwt.exception";
import { UserEntity } from "../entity/user.entity";
import { User } from "../decorator/user.decorator";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

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

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('update-me')
    @ApiResponse({ status: 200, type: UserDetailDTO })
    async updateMe(@User() user: UserEntity, @Body('data') data: UpdateProfileDTO) {
        return await this.userService.updateProfile(user.id, data);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    @ApiResponse({ status: 200, description: 'Change password success' })
    async changePassword(@User() user: UserEntity, @Body('data') data: ChangePasswordDTO) {
        return await this.userService.changePassword(user.id, data);
    }
}

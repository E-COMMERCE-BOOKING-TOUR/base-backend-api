import { AuthExceptionFilter } from '@/common/exceptions/auth.exception';
import {
    Body,
    Controller,
    Get,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    AuthResponseDTO,
    LoginDTO,
    MessageResponseDTO,
    RegisterDTO,
    TokenDTO,
    UnauthorizedResponseDto,
} from '../dtos';
import { AuthService } from '../service/auth.service';
import { JwtExceptionFilter } from '@/common/exceptions/jwt.exception';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '../entity/user.entity';
import { User } from '../decorator/user.decorator';
import { JWTRefresh } from '../types';
import { JWT } from '../decorator/jwt.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UseFilters(AuthExceptionFilter)
    @ApiResponse({
        status: 201,
        type: AuthResponseDTO,
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedResponseDto,
    })
    async register(@Body() dto: RegisterDTO) {
        return await this.authService.register(dto);
    }

    @Post('login')
    @UseFilters(AuthExceptionFilter)
    @ApiResponse({
        status: 201,
        type: AuthResponseDTO,
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedResponseDto,
    })
    async login(@Body() dto: LoginDTO) {
        return await this.authService.login(dto);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    @ApiResponse({
        status: 201,
        type: UserEntity,
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedResponseDto,
    })
    async me(@User() user: UserEntity) {
        return Promise.resolve(user);
    }

    @ApiBearerAuth('refresh-token')
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    @ApiResponse({
        status: 201,
        type: TokenDTO,
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedResponseDto,
    })
    async refresh(@JWT() jwt: JWTRefresh) {
        return await this.authService.refreshToken(jwt);
    }

    @Post('forgot-password')
    @ApiResponse({
        status: 201,
        type: MessageResponseDTO,
    })
    async forgotPassword(@Body('email') email: string) {
        return await this.authService.forgotPassword(email);
    }

    @ApiBearerAuth()
    @UseFilters(JwtExceptionFilter)
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @ApiResponse({
        status: 201,
        type: MessageResponseDTO,
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedResponseDto,
    })
    async logout(@User() user: UserEntity) {
        return await this.authService.logout(user);
    }
}

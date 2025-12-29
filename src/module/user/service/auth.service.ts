import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
    AuthResponseDTO,
    LoginDTO,
    MessageResponseDTO,
    RegisterDTO,
    TokenDTO,
} from '../dtos';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { generateUUID } from '@/utils/uuid.util';
import { comparePassword, hashPassword } from '@/utils/bcrypt.util';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthSessionEntity } from '../entity/userAuthSession.entity';
import { JwtService } from '@nestjs/jwt';
import { JWTRefresh, RefreshPayload, TokenPayload } from '../types';
import { jwtRefreshTokenConfig } from '@/config/jwt.config';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

import { MailService } from '../../mail/mail.service';
import * as crypto from 'crypto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserAuthSessionEntity)
        private readonly userAuthSessionRepository: Repository<UserAuthSessionEntity>,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        @Inject('RECOMMEND_SERVICE')
        private readonly recommendClient: ClientProxy,
    ) {}

    async register(dto: RegisterDTO) {
        // Check if username or email already exists
        const existingUser = await this.userRepository.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });

        if (existingUser) {
            throw new UnauthorizedException(
                existingUser.username === dto.username
                    ? 'Tên người dùng này đã có người sử dụng!'
                    : 'Email này đã được sử dụng!',
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(dto.password);
        const data: DeepPartial<UserEntity> = {
            ...dto,
            uuid: generateUUID(),
            status: 1,
            login_type: 0,
            password: hashedPassword,
        };

        try {
            const userInstance = await this.userRepository.save(
                this.userRepository.create(data),
            );

            // create token with payload
            const token = await this.getToken({
                uuid: userInstance.uuid,
                full_name: userInstance.full_name,
                phone: userInstance.phone,
                email: userInstance.email,
            });

            return new AuthResponseDTO({
                error: false,
                message: 'Đăng ký thành công!',
                token: new TokenDTO(token),
            });
        } catch (error) {
            throw new UnauthorizedException(
                error instanceof Error ? error.message : String(error),
            );
        }
    }

    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException(
                'Email không tồn tại trong hệ thống!',
            );
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        user.reset_password_token = resetToken;
        user.reset_password_token_expires = resetTokenExpires;
        await this.userRepository.save(user);

        // Send Email using external template and dynamic link
        const frontendUrl = this.configService.get<string>(
            'NEXT_PUBLIC_APP_URL',
        );
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        await this.mailService.sendForgotPasswordEmail(
            user.email,
            user.full_name,
            resetLink,
        );

        return new MessageResponseDTO({
            error: false,
            message: 'Yêu cầu đặt lại mật khẩu đã được gửi tới email của bạn!',
        });
    }

    async login(dto: LoginDTO) {
        // Check exists user
        const user = await this.userRepository.findOne({
            where: { username: dto.username },
            // relations: ['role'],
        });
        if (!user) {
            throw new UnauthorizedException(
                'Tài khoản hoặc mật khẩu người dùng không đúng!',
            );
        }
        // Check valid passowrd
        const isValid = await comparePassword(dto.password, user.password);
        if (!isValid) {
            throw new UnauthorizedException(
                'Tài khoản hoặc mật khẩu người dùng không đúng! 2',
            );
        }
        // Create token
        const token = await this.getToken({
            uuid: user.uuid,
            full_name: user.full_name,
            phone: user.phone,
            email: user.email,
        });

        // Merge guest data if guest_id is provided
        if (dto.guest_id) {
            this.recommendClient.emit(
                { cmd: 'merge_guest_data' },
                {
                    guestId: dto.guest_id,
                    userId: user.id.toString(),
                },
            );
        }

        return new AuthResponseDTO({
            error: false,
            message: 'Thành công!',
            token: new TokenDTO(token),
        });
    }

    async refreshToken(jwt: JWTRefresh) {
        const session = await this.userAuthSessionRepository.findOne({
            where: { user_uid: jwt.payload.uuid },
        });
        if (session && session.refresh_token === jwt.tokenRefresh) {
            const user = await this.userRepository.findOne({
                where: { uuid: jwt.payload.uuid },
            });
            // Create token
            const token = await this.getToken({
                uuid: jwt.payload.uuid,
                full_name: user?.username || '',
            });

            return new TokenDTO(token);
        } else {
            throw new UnauthorizedException('Refresh token không đúng!');
        }
    }

    async logout(user: UserEntity) {
        await this.userAuthSessionRepository.delete({
            user_uid: user.uuid,
        });
        return new MessageResponseDTO({
            error: false,
            message: 'Đăng xuất thành công!',
        });
    }

    async validateUser(uuid: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { uuid },
        });
    }

    private async getToken(payload: TokenPayload) {
        const accessToken = this.jwtService.sign(payload);
        const refreshPayload: RefreshPayload = { uuid: payload.uuid };
        const config = jwtRefreshTokenConfig();
        const refreshToken = jwt.sign(
            refreshPayload,
            config.secret,
            config.expiresIn,
        );

        // Create a session
        const session = await this.userAuthSessionRepository.findOne({
            where: { user_uid: payload.uuid },
        });

        if (session) {
            await this.userAuthSessionRepository.update(
                { id: session.id },
                {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
            );
        } else {
            await this.userAuthSessionRepository.save({
                user_uid: payload.uuid,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
}

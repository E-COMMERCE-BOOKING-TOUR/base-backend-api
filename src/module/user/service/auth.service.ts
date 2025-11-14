import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponseDTO, LoginDTO, MessageResponseDTO, RegisterDTO, TokenDTO } from '../dtos';
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

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(UserAuthSessionEntity)
        private userAuthSessionRepository: Repository<UserAuthSessionEntity>,
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) { }

    async register(dto: RegisterDTO) {
        const user = await this.userRepository.findOne({
            where: {
                username: dto.username,
            },
        });

        // Check exists user
        if (user) {
            throw new UnauthorizedException(
                'Tên người dùng này đã có người sử dụng!',
            );
        }
        // Hash password
        const hashedPassword = await hashPassword(dto.password);
        const data: DeepPartial<UserEntity> = {
            ...dto,
            uuid: generateUUID(),
            full_name: dto.username,
            email: undefined,
            status: 1,
            login_type: 0,
            password: hashedPassword,
        };
        try {
            const userInstance = await this.dataSource.transaction(
                async (manager) => {
                    // Create user Instance
                    const userInstance = manager.create(UserEntity, data);
                    // Insert to database
                    await manager.save(userInstance);
                    return userInstance;
                },
            );
            // create token with payload
            const token = await this.getToken({
                uuid: userInstance.uuid,
                full_name: userInstance.username,
                phone: userInstance.phone,
                email: userInstance.email,
            });
            return new AuthResponseDTO({
                error: false,
                message: 'Thành công!',
                token: new TokenDTO(token),
            });
        } catch (error) {
            // log error & push error
            // throw error
            throw new UnauthorizedException(error.message);
        }
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
            full_name: user.username,
            phone: user.phone,
            email: user.email,
        });

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
        const refreshToken = jwt.sign(
            refreshPayload,
            jwtRefreshTokenConfig().secret,
            jwtRefreshTokenConfig().expiresIn,
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
import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserAuthSessionEntity } from './entity/userAuthSession.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@/config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { AdminUserController } from './controller/admin-user.controller';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserAuthSessionEntity]),
        PassportModule,
        JwtModule.register(jwtConfig()),
    ],
    controllers: [AuthController, AdminUserController, UserController],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy, UserService],
})
export class UserModule { }

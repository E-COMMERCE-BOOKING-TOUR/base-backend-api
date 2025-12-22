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
import { NotificationController } from './controller/user-notification.controller';
import { AdminNotificationController } from './controller/admin-notification.controller';
import { UserService } from './service/user.service';
import { NotificationEntity } from './entity/notification.entity';
import { NotificationService } from './service/notification.service';

import { UserPaymentController } from './controller/user-payment.controller';
import { UserPaymentService } from './service/user-payment.service';
import { PaymentInfomationEntity } from './entity/paymentInfomation.entity';
import { BookingEntity } from '../booking/entity/booking.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserAuthSessionEntity,
            NotificationEntity,
            PaymentInfomationEntity,
            BookingEntity,
        ]),
        PassportModule,
        JwtModule.register(jwtConfig()),
    ],
    controllers: [
        AuthController,
        AdminUserController,
        UserController,
        NotificationController,
        AdminNotificationController,
        UserPaymentController,
    ],
    providers: [
        AuthService,
        JwtStrategy,
        JwtRefreshStrategy,
        UserService,
        NotificationService,
        UserPaymentService,
    ],
    exports: [
        TypeOrmModule, // Export TypeOrmModule to share User repositories
        PassportModule, // Export PassportModule for authentication
        JwtModule, // Export JwtModule with configuration
        JwtStrategy,
        JwtRefreshStrategy,
        AuthService,
        UserPaymentService,
    ],
})
export class UserModule { }

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
import { SupplierEntity } from './entity/supplier.entity';
import { RoleEntity } from './entity/role.entity';
import { PermissionEntity } from './entity/permission.entity';
import { AdminSupplierController } from './controller/admin-supplier.controller';
import { AdminRoleController } from './controller/admin-role.controller';
import { AdminPermissionController } from './controller/admin-permission.controller';
import { AdminSupplierService } from './service/admin-supplier.service';
import { AdminRoleService } from './service/admin-role.service';
import { AdminPermissionService } from './service/admin-permission.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserAuthSessionEntity,
            NotificationEntity,
            PaymentInfomationEntity,
            BookingEntity,
            SupplierEntity,
            RoleEntity,
            PermissionEntity,
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
        AdminSupplierController,
        AdminRoleController,
        AdminPermissionController,
    ],
    providers: [
        AuthService,
        JwtStrategy,
        JwtRefreshStrategy,
        UserService,
        NotificationService,
        UserPaymentService,
        AdminSupplierService,
        AdminRoleService,
        AdminPermissionService,
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
export class UserModule {}

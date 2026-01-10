import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChatboxController } from './controller/user-chatbox.controller';
import { UserChatboxService } from './service/user-chatbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminChatboxController } from './controller/admin-chatbox.controller';
import { AdminChatboxService } from './service/admin-chatbox.service';
import { SupplierChatboxController } from './controller/supplier-chatbox.controller';
import { SupplierChatboxService } from './service/supplier-chatbox.service';
import { ChatRoutingService } from './service/chat-routing.service';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { BookingEntity } from '@/module/booking/entity/booking.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TourEntity, BookingEntity, UserEntity, SupplierEntity]),
        ClientsModule.registerAsync([
            {
                name: 'CHATBOX_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>(
                            'CHATBOX_HOST',
                            'chatbox',
                        ),
                        port: configService.get<number>(
                            'CHATBOX_TCP_PORT',
                            8877,
                        ),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [UserChatboxController, AdminChatboxController, SupplierChatboxController],
    providers: [UserChatboxService, AdminChatboxService, SupplierChatboxService, ChatRoutingService],
    exports: [UserChatboxService, AdminChatboxService, SupplierChatboxService, ChatRoutingService],
})
export class ChatboxModule { }

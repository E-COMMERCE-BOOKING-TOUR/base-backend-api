import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChatboxController } from './controller/user-chatbox.controller';
import { UserChatboxService } from './service/user-chatbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminChatboxController } from './controller/admin-chatbox.controller';
import { AdminChatboxService } from './service/admin-chatbox.service';
import { ChatRoutingService } from './service/chat-routing.service';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { BookingEntity } from '@/module/booking/entity/booking.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TourEntity, BookingEntity]),
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
    controllers: [UserChatboxController, AdminChatboxController],
    providers: [UserChatboxService, AdminChatboxService, ChatRoutingService],
    exports: [UserChatboxService, AdminChatboxService, ChatRoutingService],
})
export class ChatboxModule { }

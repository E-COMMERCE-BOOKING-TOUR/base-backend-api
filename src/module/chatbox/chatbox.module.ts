import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserChatboxController } from './controller/user-chatbox.controller';
import { UserChatboxService } from './service/user-chatbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminChatboxController } from './controller/admin-chatbox.controller';
import { AdminChatboxService } from './service/admin-chatbox.service';

@Module({
    imports: [
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
    providers: [UserChatboxService, AdminChatboxService],
    exports: [UserChatboxService, AdminChatboxService],
})
export class ChatboxModule {}

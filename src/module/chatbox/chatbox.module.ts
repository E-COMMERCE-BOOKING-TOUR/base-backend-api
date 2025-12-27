import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserChatboxController } from './controller/user-chatbox.controller';
import { UserChatboxService } from './service/user-chatbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'CHATBOX_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('CHATBOX_HOST', 'chatbox'),
                        port: configService.get('CHATBOX_TCP_PORT', 3002),
                    },
                }),
                inject: [ConfigService],
            }
        ]),
    ],
    controllers: [UserChatboxController],
    providers: [UserChatboxService],
    exports: [UserChatboxService],
})
export class ChatboxModule { }

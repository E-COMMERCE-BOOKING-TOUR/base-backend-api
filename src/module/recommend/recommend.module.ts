import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'RECOMMEND_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('RECOMMEND_SERVICE_HOST'),
                        port: configService.get('RECOMMEND_SERVICE_PORT'),
                    },
                }),
                inject: [ConfigService],
            }
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [ClientsModule],
})
export class RecommendModule { }

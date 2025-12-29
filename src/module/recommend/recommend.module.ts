import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'RECOMMEND_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>(
                            'RECOMMEND_SERVICE_HOST',
                        ),
                        port: configService.get<number>(
                            'RECOMMEND_SERVICE_PORT',
                        ),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [ClientsModule],
})
export class RecommendModule {}

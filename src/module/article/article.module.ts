import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserArticleController } from './controller/user-article.controller';
import { UserEntity } from '../user/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ArticleServiceProxy } from './service/article.service-proxy';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                name: 'ARTICLE_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host:
                            configService.get<string>('ARTICLE_SERVICE_HOST') ||
                            'social-network',
                        port:
                            Number(
                                configService.get<string>(
                                    'ARTICLE_SERVICE_PORT',
                                ),
                            ) || 3001,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [UserArticleController],
    providers: [ArticleServiceProxy],
    exports: [ArticleServiceProxy],
})
export class ArticleModule {}

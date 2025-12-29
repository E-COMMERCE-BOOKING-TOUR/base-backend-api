import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserArticleController } from './controller/user-article.controller';
import { UserEntity } from '../user/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ArticleServiceProxy } from './service/article.service-proxy';
import { UserModule } from '../user/user.module';
import { TourEntity } from '../tour/entity/tour.entity';
import { AdminArticleServiceProxy } from './service/admin-article.service-proxy';
import { AdminArticleController } from './controller/admin-article.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, TourEntity]),
        forwardRef(() => UserModule),
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
    controllers: [UserArticleController, AdminArticleController],
    providers: [ArticleServiceProxy, AdminArticleServiceProxy],
    exports: [ArticleServiceProxy, AdminArticleServiceProxy],
})
export class ArticleModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { ArticleImageEntity } from './entity/articleImage.entity';
import { ArticleCommentEntity } from './entity/articleComment.entity';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controller/article.controller';
import { UserArticleService } from './service/userArticle.service';
import { UserArticleController } from './controller/userArticle.controller';
import { UserEntity } from '../user/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ArticleServiceProxy } from './service/article.service-proxy';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ArticleEntity,
            ArticleImageEntity,
            ArticleCommentEntity,
            UserEntity,
        ]),
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                name: 'ARTICLE_SERVICE',
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('ARTICLE_SERVICE_HOST') || 'social-network',
                        port: Number(configService.get('ARTICLE_SERVICE_PORT')) || 3001,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [ArticleController, UserArticleController],
    providers: [ArticleService, UserArticleService, ArticleServiceProxy],
    exports: [ArticleService, UserArticleService, ArticleServiceProxy],
})
export class ArticleModule { }

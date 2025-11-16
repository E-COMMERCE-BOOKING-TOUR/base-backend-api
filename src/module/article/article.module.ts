import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { ArticleImageEntity } from './entity/articleImage.entity';
import { ArticleCommentEntity } from './entity/articleComment.entity';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controller/article.controller';
import { UserEntity } from '../user/entity/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ArticleEntity,
            ArticleImageEntity,
            ArticleCommentEntity,
            UserEntity,
        ]),
    ],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports: [ArticleService],
})
export class ArticleModule { }

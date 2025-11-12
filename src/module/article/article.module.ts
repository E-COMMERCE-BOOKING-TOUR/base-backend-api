import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ArticleEntity]),
    ],
    controllers: [],
    providers: [],
})
export class ArticleModule { }

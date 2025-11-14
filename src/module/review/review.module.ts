import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entity/review.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReviewEntity]),
    ],
    controllers: [],
    providers: [],
})
export class ReviewModule { }

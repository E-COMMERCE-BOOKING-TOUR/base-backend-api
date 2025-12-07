import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entity/review.entity';
import { ReviewImageEntity } from './entity/reviewImage.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { ReviewService } from './service/review.service';
import { AdminReviewController } from './controller/admin-veview.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ReviewEntity,
            ReviewImageEntity,
            UserEntity,
            TourEntity,
        ]),
    ],
    controllers: [AdminReviewController],
    providers: [ReviewService],
})
export class ReviewModule {}

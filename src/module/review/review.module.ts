import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entity/review.entity';
import { ReviewImageEntity } from './entity/reviewImage.entity';
import { ReviewHelpfulEntity } from './entity/reviewHelpful.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { ReviewService } from './service/review.service';
import { AdminReviewController } from './controller/admin-review.controller';
import { UserReviewController } from './controller/user-review.controller';
import { UserReviewService } from './service/user-review.service';

@Module({
    imports: [
        CloudinaryModule,
        TypeOrmModule.forFeature([
            ReviewEntity,
            ReviewImageEntity,
            ReviewHelpfulEntity,
            UserEntity,
            TourEntity,
        ]),
    ],
    controllers: [AdminReviewController, UserReviewController],
    providers: [ReviewService, UserReviewService],
})
export class ReviewModule {}

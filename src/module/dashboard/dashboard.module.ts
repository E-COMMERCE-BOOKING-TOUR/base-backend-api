import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../booking/entity/booking.entity';
import { TourEntity } from '../tour/entity/tour.entity';
import { UserEntity } from '../user/entity/user.entity';
import { BookingItemEntity } from '../booking/entity/bookingItem.entity';
import { AdminDashboardController } from './controller/admin-dashboard.controller';
import { DashboardService } from './service/dashboard.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BookingEntity,
            TourEntity,
            UserEntity,
            BookingItemEntity,
        ]),
    ],
    controllers: [AdminDashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entity/booking.entity';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './service/booking.service';

@Module({
    imports: [TypeOrmModule.forFeature([BookingEntity])],
    controllers: [BookingController],
    providers: [BookingService],
})
export class BookingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entity/booking.entity';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './service/booking.service';
import { BookingItemEntity } from './entity/bookingItem.entity';
import { BookingPaymentEntity } from './entity/bookingPayment.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { UserEntity } from '@/module/user/entity/user.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourPaxTypeEntity } from '@/module/tour/entity/tourPaxType.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourVariantPaxTypePriceEntity } from '@/module/tour/entity/tourVariantPaxTypePrice.entity';
import { UserBookingService } from './service/userBooking.service';
import { UserBookingController } from './controller/userBooking.controller';
import { TourModule } from '@/module/tour/tour.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BookingEntity,
            BookingItemEntity,
            BookingPaymentEntity,
            CurrencyEntity,
            PaymentInfomationEntity,
            TourInventoryHoldEntity,
            UserEntity,
            TourVariantEntity,
            TourPaxTypeEntity,
            TourSessionEntity,
            TourVariantPaxTypePriceEntity,
        ]),
        TourModule,
    ],
    controllers: [BookingController, UserBookingController],
    providers: [BookingService, UserBookingService],
})
export class BookingModule {}

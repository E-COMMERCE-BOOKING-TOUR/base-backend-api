import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingEntity } from "./entity/booking.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([BookingEntity]),
    ],
    controllers: [],
    providers: [],
})
export class BookingModule { }
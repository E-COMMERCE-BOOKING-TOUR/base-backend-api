import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourEntity } from "./entity/tour.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([TourEntity]),
    ],
    controllers: [],
    providers: [],
})
export class TourModule { }
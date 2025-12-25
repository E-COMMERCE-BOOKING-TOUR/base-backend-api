import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { UserModule } from './module/user/user.module';
import { BookingModule } from './module/booking/booking.module';
import { ArticleModule } from './module/article/article.module';
import { TourModule } from './module/tour/tour.module';
import { ReviewModule } from './module/review/review.module';
import { CommonModule } from './module/common/common.module';
import { DashboardModule } from './module/dashboard/dashboard.module';

@Module({
    imports: [
        // Config modules
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
            expandVariables: true,
        }),
        // Database modules
        TypeOrmModule.forRootAsync({
            useFactory: () => databaseConfig(),
        }),
        // BullMQ Queue module
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                },
            }),
            inject: [ConfigService],
        }),
        // Import modules
        UserModule,
        BookingModule,
        ArticleModule,
        TourModule,
        ReviewModule,
        CommonModule,
        DashboardModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }


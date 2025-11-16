import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';
import { BookingModule } from './module/booking/booking.module';

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
        // Import modules
        UserModule,
        BookingModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }

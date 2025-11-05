import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';

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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }

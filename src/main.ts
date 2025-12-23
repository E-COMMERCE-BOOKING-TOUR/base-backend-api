import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationException } from '@/common/exceptions/validation.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.local' });

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory(errors) {
                return new ValidationException(errors);
            },
        }),
    );

    if (
        process.env.APP_ENV === 'local' ||
        process.env.APP_ENV === 'development'
    ) {
        const config = new DocumentBuilder()
            .setTitle('Booking Tour API')
            .setDescription('Api for booking tour')
            .setVersion('1.0')
            .addBearerAuth()
            .addBearerAuth(
                { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                'refresh-token',
            )
            .build();
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/v1/docs', app, documentFactory);
    }

    await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});

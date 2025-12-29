import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

// Import mock utilities
import {
    mockDatabase,
    createMockRepository,
    mockJwtService,
    mockMicroserviceClient,
    mockCloudinaryService,
    mockMailService,
} from './test-utils';

// Import entities (adjust paths as needed)
import { UserEntity } from '../src/module/user/entity/user.entity';
import { TourEntity } from '../src/module/tour/entity/tour.entity';
import { BookingEntity } from '../src/module/booking/entity/booking.entity';
import { ReviewEntity } from '../src/module/review/entity/review.entity';
import { CountryEntity } from '../src/common/entity/country.entity';
import { DivisionEntity } from '../src/common/entity/division.entity';
import { CurrencyEntity } from '../src/common/entity/currency.entity';

// Import controllers
import { AuthController } from '../src/module/user/controller/auth.controller';
import { UserController } from '../src/module/user/controller/user.controller';
import { UserTourController } from '../src/module/tour/controller/user-tour.controller';
import { UserBookingController } from '../src/module/booking/controller/user-booking.controller';
import { UserReviewController } from '../src/module/review/controller/user-review.controller';
import { UserDivisionController } from '../src/module/common/controller/user-division.controller';

// Import services
import { AuthService } from '../src/module/user/service/auth.service';
import { UserService } from '../src/module/user/service/user.service';
import { UserTourService } from '../src/module/tour/service/user-tour.service';
import { UserBookingService } from '../src/module/booking/service/user-booking.service';
import { UserReviewService } from '../src/module/review/service/user-review.service';
import { DivisionService } from '../src/module/common/service/division.service';
import { CloudinaryService } from '../src/module/cloudinary/cloudinary.service';

/**
 * Create a fully mocked test application
 * This app runs completely in memory without any database connection
 */
export async function createMockedTestApp(): Promise<INestApplication<App>> {
    // Reset mock database before each app creation
    mockDatabase.reset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [
            AuthController,
            UserController,
            UserTourController,
            UserBookingController,
            UserReviewController,
            UserDivisionController,
        ],
        providers: [
            // Services with mocked dependencies
            AuthService,
            UserService,
            UserTourService,
            UserBookingService,
            UserReviewService,
            DivisionService,

            // Mock JWT Service
            {
                provide: JwtService,
                useValue: mockJwtService,
            },

            // Mock Cloudinary Service
            {
                provide: CloudinaryService,
                useValue: mockCloudinaryService,
            },

            // Mock Microservice Clients
            {
                provide: 'RECOMMEND_SERVICE',
                useValue: mockMicroserviceClient,
            },
            {
                provide: 'CHATBOX_SERVICE',
                useValue: mockMicroserviceClient,
            },
            {
                provide: 'ARTICLE_SERVICE',
                useValue: mockMicroserviceClient,
            },

            // Mock Repositories
            {
                provide: getRepositoryToken(UserEntity),
                useValue: createMockRepository('users'),
            },
            {
                provide: getRepositoryToken(TourEntity),
                useValue: createMockRepository('tours'),
            },
            {
                provide: getRepositoryToken(BookingEntity),
                useValue: createMockRepository('bookings'),
            },
            {
                provide: getRepositoryToken(ReviewEntity),
                useValue: createMockRepository('reviews'),
            },
            {
                provide: getRepositoryToken(CountryEntity),
                useValue: createMockRepository('countries'),
            },
            {
                provide: getRepositoryToken(DivisionEntity),
                useValue: createMockRepository('divisions'),
            },
            {
                provide: getRepositoryToken(CurrencyEntity),
                useValue: createMockRepository('currencies'),
            },
        ],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply global prefix and pipes
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    await app.init();
    return app;
}

/**
 * Alternative: Create minimal test app for specific controller
 * Use this for more focused unit-like E2E tests
 */
export async function createMinimalTestApp(
    controllers: any[],
    providers: any[],
): Promise<INestApplication<App>> {
    mockDatabase.reset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers,
        providers: [
            // Always include mock JWT
            {
                provide: JwtService,
                useValue: mockJwtService,
            },
            ...providers,
        ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    await app.init();
    return app;
}

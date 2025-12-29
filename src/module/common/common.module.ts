import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionEntity } from '@/common/entity/division.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { SiteSettingEntity } from '@/common/entity/site-setting.entity';
import { StaticPageEntity } from '@/common/entity/static-page.entity';

import { UserDivisionController } from './controller/user-division.controller';
import { AdminDivisionController } from './controller/admin-division.controller';
import { AdminCurrencyController } from './controller/admin-currency.controller';
import { AdminSettingController } from './controller/admin-setting.controller';
import { UserSettingController } from './controller/user-setting.controller';
import { AdminStaticPageController } from './controller/admin-static-page.controller';
import { UserStaticPageController } from './controller/user-static-page.controller';

import { DivisionService } from './service/division.service';
import { AdminDivisionService } from './service/admin-division.service';
import { AdminCurrencyService } from './service/admin-currency.service';
import { AdminSettingService } from './service/admin-setting.service';
import { AdminStaticPageService } from './service/admin-static-page.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DivisionEntity,
            CountryEntity,
            CurrencyEntity,
            SiteSettingEntity,
            StaticPageEntity,
        ]),
        CloudinaryModule,
    ],
    controllers: [
        UserDivisionController,
        AdminDivisionController,
        AdminCurrencyController,
        AdminSettingController,
        UserSettingController,
        AdminStaticPageController,
        UserStaticPageController,
    ],
    providers: [
        DivisionService,
        AdminDivisionService,
        AdminCurrencyService,
        AdminSettingService,
        AdminStaticPageService,
    ],
    exports: [
        DivisionService,
        AdminDivisionService,
        AdminCurrencyService,
        AdminSettingService,
        AdminStaticPageService,
    ],
})
export class CommonModule {}

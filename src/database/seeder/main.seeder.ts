import { DataSource } from 'typeorm';
import { runSeeders, Seeder } from 'typeorm-extension';
import CurrencySeeder from './01-currency.seeder';
import CountrySeeder from './02-country.seeder';
import DivisionSeeder from './03-division.seeder';
import PermissionSeeder from './04-permission.seeder';
import RoleSeeder from './05-role.seeder';
import SupplierSeeder from './06-supplier.seeder';
import UserSeeder from './07-user.seeder';
import PaymentInformationSeeder from './08-payment-information.seeder';
import TourCategorySeeder from './09-tour-category.seeder';
import TourPaxTypeSeeder from './10-tour-pax-type.seeder';
import TourSeeder from './11-tour.seeder';
import TourImageSeeder from './12-tour-image.seeder';
import TourVariantSeeder from './13-tour-variant.seeder';
import TourVariantPaxPriceSeeder from './14-tour-variant-pax-price.seeder';
import TourSessionSeeder from './15-tour-session.seeder';

import TourPolicySeeder from './17-tour-policy.seeder';
import TourCategoryRelationSeeder from './18-tour-category-relation.seeder';
import ReviewSeeder from './22-review.seeder';
import ReviewImageSeeder from './23-review-image.seeder';
import BookingPaymentSeeder from './24-booking-payment.seeder';
import NotificationSeeder from './26-notification.seeder';
import SiteSettingSeeder from './27-site-setting.seeder';
import StaticPageSeeder from './28-static-page.seeder';

export default class MainSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        try {
            await runSeeders(dataSource, {
                seeds: [
                    // Master Data
                    CurrencySeeder,
                    CountrySeeder,
                    DivisionSeeder,

                    // User Module
                    PermissionSeeder,
                    RoleSeeder,
                    SupplierSeeder,
                    UserSeeder,
                    PaymentInformationSeeder,

                    // Tour Module
                    TourCategorySeeder,
                    TourPaxTypeSeeder,
                    TourSeeder,
                    TourImageSeeder,
                    TourVariantSeeder,
                    TourVariantPaxPriceSeeder,
                    TourSessionSeeder,

                    TourPolicySeeder,
                    TourCategoryRelationSeeder,

                    // Review Module
                    ReviewSeeder,
                    ReviewImageSeeder,

                    // Booking Module
                    BookingPaymentSeeder,
                    // BookingSeeder,

                    // Notification Module
                    NotificationSeeder,

                    // Site Settings
                    SiteSettingSeeder,
                    StaticPageSeeder,
                ],
            });
        } catch (error) {
            console.error('Seeding failed:', error);
            throw error;
        }
    }
}

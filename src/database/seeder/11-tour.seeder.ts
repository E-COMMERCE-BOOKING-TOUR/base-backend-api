import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { DivisionEntity } from '@/common/entity/division.entity';
import { CurrencyEntity } from '@/common/entity/currency.entity';
import { TourStatus } from '@/module/tour/dto/tour.dto';

export default class TourSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const tourRepository = dataSource.getRepository(TourEntity);
        const supplierRepository = dataSource.getRepository(SupplierEntity);
        const countryRepository = dataSource.getRepository(CountryEntity);
        const divisionRepository = dataSource.getRepository(DivisionEntity);
        const currencyRepository = dataSource.getRepository(CurrencyEntity);

        // Get data
        const vietnam = await countryRepository.findOne({
            where: { iso3: 'VN' },
        });

        const vnd = await currencyRepository.findOne({
            where: { symbol: 'VND' },
        });
        const usd = await currencyRepository.findOne({
            where: { symbol: 'USD' },
        });

        const suppliers = await supplierRepository.find({
            where: { status: TourStatus.active },
        });

        if (!vietnam || !vnd || suppliers.length === 0) {
            console.log('⚠️ Required data not found, skipping tour seeder');
            return;
        }

        // Get divisions
        const hcm = await divisionRepository.findOne({ where: { code: 'SG' } });
        const hanoi = await divisionRepository.findOne({
            where: { code: 'HN' },
        });
        const danang = await divisionRepository.findOne({
            where: { code: 'DN' },
        });
        const nhatrang = await divisionRepository.findOne({
            where: { code: 'KH' },
        });
        const phuquoc = await divisionRepository.findOne({
            where: { code: 'PQ' },
        });
        const dalat = await divisionRepository.findOne({
            where: { code: 'LD' },
        });
        const halong = await divisionRepository.findOne({
            where: { code: 'QN' },
        });
        const sapa = await divisionRepository.findOne({
            where: { code: 'LC' },
        });
        const hoian = await divisionRepository.findOne({
            where: { code: 'QNA' },
        });
        const hue = await divisionRepository.findOne({ where: { code: 'TT' } });

        const tours: DeepPartial<TourEntity>[] = [
            // Ho Chi Minh City Tours
            {
                title: 'Saigon City Tour - Discover the Pearl of the Far East',
                slug: 'saigon-city-tour',
                description:
                    "<h2>Explore the vibrant streets of Ho Chi Minh City</h2><p>Visit Notre Dame Cathedral, Central Post Office, War Remnants Museum, and Ben Thanh Market. Experience the bustling life of Vietnam's largest city with expert local guides.</p><p>Highlights include:</p><ul><li>Notre Dame Cathedral and Central Post Office</li><li>War Remnants Museum</li><li>Reunification Palace</li><li>Ben Thanh Market shopping experience</li><li>Local Vietnamese lunch</li></ul>",
                summary:
                    'Full day tour exploring the best of Ho Chi Minh City including historical sites, museums, and local markets.',
                map_url: 'https://maps.google.com/?q=Ho+Chi+Minh+City',
                address: '123 Nguyen Hue Street, District 1',
                score_rating: 4.8,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-15'),
                status: TourStatus.active,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 2,
                max_pax: 15,
                country: vietnam || undefined,
                division: hcm || undefined,
                currency: vnd || undefined,
                supplier: suppliers[0] || undefined,
            },
            {
                title: 'Mekong Delta Discovery - 2 Days 1 Night',
                slug: 'mekong-delta-2-days',
                description:
                    '<h2>Experience the authentic Mekong Delta life</h2><p>Explore the floating markets, fruit orchards, and traditional villages of the Mekong Delta. Cruise along scenic waterways and enjoy homestay experience with local families.</p><p>Day 1: Floating markets, fruit gardens, coconut candy workshop</p><p>Day 2: Village cycling, traditional music performance, return to Saigon</p>',
                summary:
                    'Two-day adventure through Mekong Delta with floating markets, homestay experience, and cultural activities.',
                map_url: 'https://maps.google.com/?q=Mekong+Delta',
                address: '456 Tran Hung Dao, District 5',
                score_rating: 4.9,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-20'),
                status: TourStatus.active,
                duration_hours: undefined,
                duration_days: 2,
                min_pax: 4,
                max_pax: 20,
                country: vietnam || undefined,
                division: hcm || undefined,
                currency: vnd || undefined,
                supplier: suppliers[3] || undefined,
            },
            {
                title: 'Cu Chi Tunnels Half Day Tour',
                slug: 'cu-chi-tunnels-half-day',
                description:
                    '<h2>Journey into Vietnam War history</h2><p>Visit the legendary Cu Chi Tunnels, an incredible underground network used by Vietnamese guerrillas during the war. Crawl through the tunnels and learn about ingenious survival techniques.</p>',
                summary:
                    'Half-day tour to the historic Cu Chi Tunnels with expert war historian guide.',
                map_url: 'https://maps.google.com/?q=Cu+Chi+Tunnels',
                address: '789 Le Duan, District 1',
                score_rating: 4.7,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-01'),
                status: TourStatus.active,
                duration_hours: 5,
                duration_days: undefined,
                min_pax: 2,
                max_pax: 25,
                country: vietnam || undefined,
                division: hcm || undefined,
                currency: vnd || undefined,
                supplier: suppliers[0] || undefined,
            },
            // Hanoi Tours
            {
                title: 'Hanoi Old Quarter Walking Tour & Street Food',
                slug: 'hanoi-old-quarter-walking-tour',
                description:
                    "<h2>Discover Hanoi's ancient streets and delicious cuisine</h2><p>Walk through the historic Old Quarter with 36 ancient streets. Sample authentic Vietnamese street food including pho, banh mi, egg coffee, and more.</p>",
                summary:
                    'Evening walking tour through Hanoi Old Quarter with street food tasting experience.',
                map_url: 'https://maps.google.com/?q=Hanoi+Old+Quarter',
                address: '12 Hang Bac Street, Hoan Kiem',
                score_rating: 4.9,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-10'),
                status: TourStatus.active,
                duration_hours: 4,
                duration_days: undefined,
                min_pax: 2,
                max_pax: 12,
                country: vietnam || undefined,
                division: hanoi || undefined,
                currency: vnd || undefined,
                supplier: suppliers[2] || undefined,
            },
            {
                title: 'Halong Bay Luxury Cruise - 2 Days 1 Night',
                slug: 'halong-bay-luxury-cruise-2days',
                description:
                    '<h2>Cruise through UNESCO World Heritage Site</h2><p>Experience the magical beauty of Halong Bay aboard a luxury cruise. Enjoy kayaking, swimming, cave exploration, and fresh seafood. Watch sunset and sunrise over limestone karsts.</p><p>Includes: Luxury cabin, all meals, activities, and professional cruise staff.</p>',
                summary:
                    'Premium overnight cruise in Halong Bay with full-service amenities and activities.',
                map_url: 'https://maps.google.com/?q=Halong+Bay',
                address: '45 Tuan Chau Island, Halong City',
                score_rating: 5.0,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-05'),
                status: TourStatus.active,
                duration_hours: undefined,
                duration_days: 2,
                min_pax: 2,
                max_pax: 30,
                country: vietnam || undefined,
                division: halong || undefined,
                currency: usd || undefined,
                supplier: suppliers[2] || undefined,
            },
            {
                title: 'Sapa Trekking Adventure - 3 Days 2 Nights',
                slug: 'sapa-trekking-3-days',
                description:
                    '<h2>Trek through stunning rice terraces and ethnic villages</h2><p>Hike through spectacular mountain scenery, visit ethnic minority villages, stay with local families, and experience traditional highland culture.</p><p>Visit Cat Cat, Y Linh Ho, Lao Chai, Ta Van villages. Moderate difficulty trekking.</p>',
                summary:
                    'Three-day trekking adventure in Sapa with homestay and cultural immersion.',
                map_url: 'https://maps.google.com/?q=Sapa+Vietnam',
                address: '88 Fansipan Street, Sapa Town',
                score_rating: 4.8,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-10'),
                status: TourStatus.active,
                duration_hours: undefined,
                duration_days: 3,
                min_pax: 4,
                max_pax: 12,
                country: vietnam || undefined,
                division: sapa || undefined,
                currency: vnd || undefined,
                supplier: suppliers[4] || undefined,
            },
            // Da Nang & Hoi An Tours
            {
                title: 'Hoi An Ancient Town & Lantern Making Workshop',
                slug: 'hoi-an-ancient-town-workshop',
                description:
                    '<h2>Explore the charming UNESCO town of Hoi An</h2><p>Walk through ancient streets, visit historic merchant houses, Japanese Bridge, and create your own traditional lantern. Evening river cruise with lantern release included.</p>',
                summary:
                    'Full day tour in Hoi An with lantern workshop and evening river activities.',
                map_url: 'https://maps.google.com/?q=Hoi+An',
                address: '56 Tran Phu Street, Hoi An',
                score_rating: 4.9,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-25'),
                status: TourStatus.active,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 2,
                max_pax: 15,
                country: vietnam || undefined,
                division: hoian || undefined,
                currency: vnd || undefined,
                supplier: suppliers[1] || undefined,
            },
            {
                title: 'Ba Na Hills & Golden Bridge Tour',
                slug: 'ba-na-hills-golden-bridge',
                description:
                    '<h2>Visit the famous Golden Bridge and Ba Na Hills</h2><p>Take the cable car to Ba Na Hills, walk on the iconic Golden Bridge held by giant hands, explore French Village, and enjoy Fantasy Park amusement rides.</p>',
                summary:
                    'Day trip to Ba Na Hills featuring the stunning Golden Bridge and entertainment park.',
                map_url: 'https://maps.google.com/?q=Ba+Na+Hills',
                address: '23 Bach Dang, Da Nang',
                score_rating: 4.7,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-05'),
                status: TourStatus.active,
                duration_hours: 9,
                duration_days: 1,
                min_pax: 2,
                max_pax: 30,
                country: vietnam || undefined,
                division: danang || undefined,
                currency: vnd || undefined,
                supplier: suppliers[1] || undefined,
            },
            {
                title: 'Marble Mountains & Monkey Mountain Tour',
                slug: 'marble-mountains-monkey-mountain',
                description:
                    '<h2>Explore natural caves and Buddhist sanctuaries</h2><p>Climb the five Marble Mountains with stunning caves, pagodas, and viewpoints. Visit Lady Buddha statue at Linh Ung Pagoda on Monkey Mountain.</p>',
                summary:
                    "Half-day tour visiting Da Nang's spiritual and natural landmarks.",
                map_url: 'https://maps.google.com/?q=Marble+Mountains+Da+Nang',
                address: '67 Ngu Hanh Son, Da Nang',
                score_rating: 4.6,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-15'),
                status: TourStatus.active,
                duration_hours: 5,
                duration_days: undefined,
                min_pax: 2,
                max_pax: 20,
                country: vietnam || undefined,
                division: danang || undefined,
                currency: vnd || undefined,
                supplier: suppliers[1] || undefined,
            },
            // Central Vietnam Tours
            {
                title: 'Hue Imperial City & Royal Tombs',
                slug: 'hue-imperial-city-royal-tombs',
                description:
                    "<h2>Journey through Vietnam's royal history</h2><p>Visit the Imperial Citadel, Forbidden Purple City, and majestic royal tombs along Perfume River. Experience royal court music and traditional Hue cuisine.</p>",
                summary:
                    "Full day tour exploring Hue's imperial heritage and royal architecture.",
                map_url: 'https://maps.google.com/?q=Hue+Imperial+City',
                address: '12 Le Loi, Hue City',
                score_rating: 4.8,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-18'),
                status: TourStatus.active,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 2,
                max_pax: 20,
                country: vietnam || undefined,
                division: hue || undefined,
                currency: vnd || undefined,
                supplier: suppliers[6] || undefined,
            },
            // Beach Tours
            {
                title: 'Nha Trang Island Hopping & Snorkeling',
                slug: 'nha-trang-island-hopping',
                description:
                    '<h2>Explore beautiful islands and coral reefs</h2><p>Visit Hon Mun, Hon Tam, and Hon Mieu islands. Snorkel in crystal-clear waters, enjoy fresh seafood lunch on beach, and relax on pristine sandy shores.</p>',
                summary:
                    'Full day boat tour visiting multiple islands with snorkeling and beach activities.',
                map_url: 'https://maps.google.com/?q=Nha+Trang',
                address: '89 Tran Phu, Nha Trang',
                score_rating: 4.7,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-20'),
                status: TourStatus.active,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 4,
                max_pax: 40,
                country: vietnam || undefined,
                division: nhatrang || undefined,
                currency: vnd || undefined,
                supplier: suppliers[5] || undefined,
            },
            {
                title: 'Phu Quoc Paradise - 3 Days 2 Nights Beach Escape',
                slug: 'phu-quoc-3-days-beach',
                description:
                    "<h2>Relax on Vietnam's most beautiful island</h2><p>Enjoy pristine beaches, explore fishing villages, visit pepper farms, snorkel at An Thoi archipelago, and watch stunning sunsets. Resort accommodation included.</p>",
                summary:
                    'Three-day beach vacation package in Phu Quoc with activities and resort stay.',
                map_url: 'https://maps.google.com/?q=Phu+Quoc',
                address: '234 Tran Hung Dao, Duong Dong',
                score_rating: 4.9,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-01-30'),
                status: TourStatus.active,
                duration_hours: undefined,
                duration_days: 3,
                min_pax: 2,
                max_pax: 20,
                country: vietnam || undefined,
                division: phuquoc || undefined,
                currency: vnd || undefined,
                supplier: suppliers[5] || undefined,
            },
            // Highland Tours
            {
                title: 'Dalat Romantic City Tour with Flower Gardens',
                slug: 'dalat-city-tour-flower-gardens',
                description:
                    '<h2>Discover the City of Eternal Spring</h2><p>Visit Dalat Flower Park, Crazy House, Bao Dai Summer Palace, and Linh Phuoc Pagoda. Enjoy cool mountain air and French colonial architecture. Coffee plantation tour included.</p>',
                summary:
                    "Full day exploring Dalat's gardens, palaces, and unique attractions.",
                map_url: 'https://maps.google.com/?q=Dalat',
                address: '45 Tran Phu, Dalat City',
                score_rating: 4.6,
                tax: 10,
                is_visible: true,
                published_at: new Date('2024-02-25'),
                status: TourStatus.active,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 2,
                max_pax: 16,
                country: vietnam || undefined,
                division: dalat || undefined,
                currency: vnd || undefined,
                supplier: suppliers[4] || undefined,
            },
            // Draft/Inactive Tours
            {
                title: 'New Tour Being Developed - Ninh Binh Cycling',
                slug: 'ninh-binh-cycling-tour',
                description:
                    '<h2>Cycle through Halong Bay on land</h2><p>This tour is currently being developed.</p>',
                summary:
                    'Cycling tour through Ninh Binh countryside - Coming soon',
                map_url: 'https://maps.google.com/?q=Ninh+Binh',
                address: 'To be announced',
                score_rating: undefined,
                tax: 10,
                is_visible: false,
                published_at: undefined,
                status: TourStatus.draft,
                duration_hours: 8,
                duration_days: 1,
                min_pax: 4,
                max_pax: 15,
                country: vietnam || undefined,
                division: hanoi || undefined,
                currency: vnd || undefined,
                supplier: suppliers[2] || undefined,
            },
        ];

        for (const tour of tours) {
            const exists = await tourRepository.findOne({
                where: { slug: tour.slug },
            });
            if (!exists) {
                await tourRepository.save(tourRepository.create(tour));
            }
        }

        console.log('Tour seeded');
    }
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { SiteSettingEntity } from '@/common/entity/site-setting.entity';

export default class SiteSettingSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(SiteSettingEntity);

        const settings = {
            site_title: 'TripConnect',
            meta_description: 'Nền tảng đặt tour du lịch hàng đầu Việt Nam. Khám phá hàng ngàn tour hấp dẫn với giá cực ưu đãi.',
            meta_keywords: 'du lịch, đặt tour, tour sapa, tour hạ long, tour đà nẵng, giá rẻ',
            company_name: 'TripConnect Travel & Technology JSC',
            address: 'Đường Hàn Thuyên, khu phố 6, P.Linh Trung, Tp.Thủ Đức, Tp.HCM',
            phone: '+84 123 456 789',
            email: 'contact@tripconnect.com',
            copyright_text: '© 2024 TripConnect. All rights reserved.',
            footer_description: 'TripConnect là nền tảng kết nối du khách với các nhà cung cấp tour uy tín trên toàn quốc, mang đến trải nghiệm du lịch trọn vẹn và an toàn.',
            facebook_url: 'https://facebook.com/tripconnect',
            instagram_url: 'https://instagram.com/tripconnect',
            twitter_url: 'https://twitter.com/tripconnect',
            youtube_url: 'https://youtube.com/tripconnect',
            banners_square: [],
            banners_rectangle: [],
        };

        const exists = await repository.findOne({ where: { id: 1 } });
        if (!exists) {
            await repository.save(repository.create({ id: 1, ...settings }));
            console.log('Site settings seeded');
        } else {
            console.log('Site settings already exists');
        }
    }
}

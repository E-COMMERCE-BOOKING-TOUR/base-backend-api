import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { StaticPageEntity } from '@/common/entity/static-page.entity';

export default class StaticPageSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(StaticPageEntity);

        const pages = [
            {
                title: 'Thông tin công ty',
                slug: 'thong-tin-cong-ty',
                content: '<h1>Thông tin công ty</h1><p>Nội dung đang được cập nhật...</p>',
                meta_title: 'Thông tin công ty - TripConnect',
                meta_description: 'Tìm hiểu thêm về TripConnect, sứ mệnh và giá trị cốt lõi của chúng tôi.',
            },
            {
                title: 'Điều khoản và điều kiện',
                slug: 'dieu-khoan-va-dieu-kien',
                content: '<h1>Điều khoản và điều kiện</h1><p>Nội dung đang được cập nhật...</p>',
                meta_title: 'Điều khoản và điều kiện - TripConnect',
                meta_description: 'Thông tin chi tiết về các điều khoản và điều kiện sử dụng dịch vụ của TripConnect.',
            },
            {
                title: 'Chính sách và quyền riêng tư',
                slug: 'chinh-sach-va-quyen-rieng-tu',
                content: '<h1>Chính sách và quyền riêng tư</h1><p>Nội dung đang được cập nhật...</p>',
                meta_title: 'Chính sách và quyền riêng tư - TripConnect',
                meta_description: 'Cam kết của TripConnect về việc bảo vệ quyền riêng tư và dữ liệu của người dùng.',
            },
            {
                title: 'FAQs',
                slug: 'faqs',
                content: '<h1>Câu hỏi thường gặp (FAQs)</h1><p>Nội dung đang được cập nhật...</p>',
                meta_title: 'Câu hỏi thường gặp - TripConnect',
                meta_description: 'Giải đáp các thắc mắc phổ biến về dịch vụ, đặt tour và thanh toán tại TripConnect.',
            },
        ];

        for (const pageData of pages) {
            const exists = await repository.findOne({ where: { slug: pageData.slug } });
            if (!exists) {
                const page = repository.create(pageData);
                await repository.save(page);
                console.log(`Static page seeded: ${pageData.slug}`);
            }
        }
    }
}

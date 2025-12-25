import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettingEntity } from '@/common/entity/site-setting.entity';
import { UpdateSiteSettingDTO } from '../dto/admin-setting.dto';

@Injectable()
export class AdminSettingService {
    constructor(
        @InjectRepository(SiteSettingEntity)
        private readonly settingRepository: Repository<SiteSettingEntity>,
    ) { }

    async getSettings(): Promise<SiteSettingEntity> {
        // Get the first (and only) settings record, or create default if not exists
        let settings = await this.settingRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            settings = this.settingRepository.create({
                site_title: 'TripConnect',
                company_name: 'TripConnect Company',
                copyright_text: '© 2024 TripConnect. All rights reserved.',
                banners_square: [],
                banners_rectangle: [],
            });
            await this.settingRepository.save(settings);
        }

        return settings;
    }

    async updateSettings(dto: UpdateSiteSettingDTO): Promise<SiteSettingEntity> {
        let settings = await this.getSettings();

        // Update all provided fields
        Object.keys(dto).forEach(key => {
            if (dto[key as keyof UpdateSiteSettingDTO] !== undefined) {
                (settings as any)[key] = dto[key as keyof UpdateSiteSettingDTO];
            }
        });

        return this.settingRepository.save(settings);
    }
}

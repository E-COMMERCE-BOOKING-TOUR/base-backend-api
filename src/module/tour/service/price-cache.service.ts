import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TourEntity } from '../entity/tour.entity';
import { TourStatus } from '../dto/tour.dto';
import { PRICE_CACHE_QUEUE } from '../queue/price-cache.processor';

@Injectable()
export class PriceCacheService {
    private readonly logger = new Logger(PriceCacheService.name);

    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
        @InjectQueue(PRICE_CACHE_QUEUE) private priceCacheQueue: Queue,
    ) { }

    /**
     * Calculate and cache min/max prices for a single tour (Async via Queue)
     */
    async updateTourPriceCache(tourId: number): Promise<void> {
        await this.priceCacheQueue.add('update-single', { tourId });
        this.logger.debug(`Queued price cache update for tour ${tourId}`);
    }

    /**
     * Batch update price cache for all tours (Async via Queue)
     */
    async updateAllTourPriceCache(): Promise<{ message: string }> {
        await this.priceCacheQueue.add('update-all', {});
        this.logger.log('Queued batch price cache update for all tours');
        return { message: 'Batch update job queued' };
    }

    /**
     * Update price cache for multiple tours by IDs (Async via Queue)
     */
    async updateTourPriceCacheByIds(tourIds: number[]): Promise<void> {
        if (tourIds.length === 0) return;
        await this.priceCacheQueue.add('update-batch', { tourIds });
        this.logger.log(`Queued price cache update for ${tourIds.length} tours`);
    }

    /**
     * Cron job to refresh all tour price caches every hour
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handlePriceCacheRefresh(): Promise<void> {
        this.logger.log('Running scheduled price cache refresh via queue...');
        await this.updateAllTourPriceCache();
    }
}

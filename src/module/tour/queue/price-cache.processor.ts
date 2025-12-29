import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TourEntity } from '../entity/tour.entity';
import { TourStatus } from '../dto/tour.dto';

export const PRICE_CACHE_QUEUE = 'price-cache';

export interface UpdateSingleJobData {
    tourId: number;
}

export interface UpdateBatchJobData {
    tourIds: number[];
}

@Processor(PRICE_CACHE_QUEUE)
export class PriceCacheProcessor extends WorkerHost {
    private readonly logger = new Logger(PriceCacheProcessor.name);

    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
    ) {
        super();
    }

    async process(
        job: Job<UpdateSingleJobData | UpdateBatchJobData | undefined>,
    ): Promise<any> {
        this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'update-single':
                return this.handleUpdateSingle(job as Job<UpdateSingleJobData>);
            case 'update-all':
                return this.handleUpdateAll();
            case 'update-batch':
                return this.handleUpdateBatch(job as Job<UpdateBatchJobData>);
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
                return { success: false, error: 'Unknown job type' };
        }
    }

    private async handleUpdateSingle(
        job: Job<UpdateSingleJobData>,
    ): Promise<{ success: boolean }> {
        const { tourId } = job.data;
        this.logger.log(`Updating price cache for tour ${tourId}`);

        try {
            const tour = await this.tourRepository.findOne({
                where: { id: tourId },
                relations: [
                    'variants',
                    'variants.tour_variant_pax_type_prices',
                ],
            });

            if (!tour) {
                this.logger.warn(`Tour ${tourId} not found`);
                return { success: false };
            }

            const { minPrice, maxPrice } = this.calculatePrices(tour);

            await this.tourRepository.update(tourId, {
                cached_min_price: minPrice,
                cached_max_price: maxPrice,
                price_cached_at: new Date(),
            });

            this.logger.debug(
                `Updated price cache for tour ${tourId}: min=${minPrice}, max=${maxPrice}`,
            );
            return { success: true };
        } catch (error) {
            this.logger.error(
                `Failed to update price cache for tour ${tourId}`,
                error,
            );
            throw error;
        }
    }

    private async handleUpdateAll(): Promise<{
        updated: number;
        failed: number;
    }> {
        this.logger.log('Starting batch price cache update for all tours...');

        const tours = await this.tourRepository.find({
            relations: ['variants', 'variants.tour_variant_pax_type_prices'],
        });

        let updated = 0;
        let failed = 0;

        for (const tour of tours) {
            try {
                const { minPrice, maxPrice } = this.calculatePrices(tour);

                await this.tourRepository.update(tour.id, {
                    cached_min_price: minPrice,
                    cached_max_price: maxPrice,
                    price_cached_at: new Date(),
                });

                updated++;
            } catch (error) {
                this.logger.error(
                    `Failed to update price cache for tour ${tour.id}`,
                    error,
                );
                failed++;
            }
        }

        this.logger.log(
            `Batch price cache update completed: ${updated} updated, ${failed} failed`,
        );
        return { updated, failed };
    }

    private async handleUpdateBatch(
        job: Job<UpdateBatchJobData>,
    ): Promise<{ updated: number }> {
        const { tourIds } = job.data;
        this.logger.log(`Updating price cache for ${tourIds.length} tours`);

        const tours = await this.tourRepository.find({
            where: { id: In(tourIds) },
            relations: ['variants', 'variants.tour_variant_pax_type_prices'],
        });

        let updated = 0;

        for (const tour of tours) {
            const { minPrice, maxPrice } = this.calculatePrices(tour);

            await this.tourRepository.update(tour.id, {
                cached_min_price: minPrice,
                cached_max_price: maxPrice,
                price_cached_at: new Date(),
            });

            updated++;
        }

        return { updated };
    }

    private calculatePrices(tour: TourEntity): {
        minPrice: number | undefined;
        maxPrice: number | undefined;
    } {
        const allPrices: number[] = [];

        if (tour.variants && tour.variants.length > 0) {
            tour.variants
                .filter(
                    (v) =>
                        (v.status as unknown as TourStatus) ===
                        TourStatus.active,
                )
                .forEach((variant) => {
                    if (variant.tour_variant_pax_type_prices?.length > 0) {
                        variant.tour_variant_pax_type_prices
                            .filter((p) => p.price > 0)
                            .forEach((p) => allPrices.push(p.price));
                    }
                });
        }

        if (allPrices.length === 0) {
            return { minPrice: undefined, maxPrice: undefined };
        }

        return {
            minPrice: Math.min(...allPrices),
            maxPrice: Math.max(...allPrices),
        };
    }
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';

export default class TourSessionSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const sessionRepository = dataSource.getRepository(TourSessionEntity);
        const variantRepository = dataSource.getRepository(TourVariantEntity);

        const variants = await variantRepository.find({
            where: { status: 'active' },
            relations: ['tour'],
        });

        if (variants.length === 0) {
            console.log('⚠️ No variants found, skipping tour session seeder');
            return;
        }

        // Create sessions for next 60 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const variant of variants) {
            // Skip draft tours
            if (variant.tour.status === 'draft') continue;

            // Create sessions based on tour type
            const isDailyTour =
                variant.tour.duration_hours && variant.tour.duration_hours <= 8;
            const isMultiDay =
                variant.tour.duration_days && variant.tour.duration_days > 1;

            for (let i = 0; i < 60; i++) {
                const sessionDate = new Date(today);
                sessionDate.setDate(sessionDate.getDate() + i);

                if (isDailyTour) {
                    // Morning session (8:00 AM)
                    const morningExists = await sessionRepository.findOne({
                        where: {
                            tour_variant: { id: variant.id },
                            session_date: sessionDate,
                            start_time: new Date('1970-01-01T08:00:00'),
                        },
                    });
                    if (!morningExists) {
                        await sessionRepository.save(
                            sessionRepository.create({
                                session_date: sessionDate,
                                start_time: new Date('1970-01-01T08:00:00'),
                                end_time: new Date(
                                    `1970-01-01T${8 + (variant.tour.duration_hours || 8)}:00:00`,
                                ),
                                capacity: variant.capacity_per_slot,
                                status:
                                    i < 7 ? 'open' : i < 14 ? 'open' : 'open',
                                tour_variant: variant,
                            } as any),
                        );
                    }

                    // Afternoon session if half-day tour
                    if (
                        variant.tour.duration_hours &&
                        variant.tour.duration_hours <= 5
                    ) {
                        const afternoonExists = await sessionRepository.findOne(
                            {
                                where: {
                                    tour_variant: { id: variant.id },
                                    session_date: sessionDate,
                                    start_time: new Date('1970-01-01T14:00:00'),
                                },
                            },
                        );
                        if (!afternoonExists) {
                            await sessionRepository.save(
                                sessionRepository.create({
                                    session_date: sessionDate,
                                    start_time: new Date('1970-01-01T14:00:00'),
                                    end_time: new Date(
                                        `1970-01-01T${14 + (variant.tour.duration_hours || 5)}:00:00`,
                                    ),
                                    capacity: variant.capacity_per_slot,
                                    status: 'open',
                                    tour_variant: variant,
                                } as any),
                            );
                        }
                    }
                } else if (isMultiDay) {
                    // Multi-day tours - one session per day starting at 7:00 AM
                    // Only create if not already exists for this date
                    const exists = await sessionRepository.findOne({
                        where: {
                            tour_variant: { id: variant.id },
                            session_date: sessionDate,
                        },
                    });
                    if (!exists) {
                        // Randomly set some sessions as full or closed for realism
                        let status: 'open' | 'full' | 'closed' = 'open';
                        if (i < 7 && Math.random() > 0.7) {
                            status = 'full';
                        } else if (i < 3 && Math.random() > 0.9) {
                            status = 'closed';
                        }

                        await sessionRepository.save(
                            sessionRepository.create({
                                session_date: sessionDate,
                                start_time: new Date('1970-01-01T07:00:00'),
                                end_time: null,
                                capacity: variant.capacity_per_slot,
                                status: status,
                                tour_variant: variant,
                            } as any),
                        );
                    }
                } else {
                    // Full day tours - one session at 8:00 AM
                    const exists = await sessionRepository.findOne({
                        where: {
                            tour_variant: { id: variant.id },
                            session_date: sessionDate,
                        },
                    });
                    if (!exists) {
                        await sessionRepository.save(
                            sessionRepository.create({
                                session_date: sessionDate,
                                start_time: new Date('1970-01-01T08:00:00'),
                                end_time: new Date('1970-01-01T18:00:00'),
                                capacity: variant.capacity_per_slot,
                                status: 'open',
                                tour_variant: variant,
                            } as any),
                        );
                    }
                }
            }
        }

        console.log('Tour Session seeded');
    }
}

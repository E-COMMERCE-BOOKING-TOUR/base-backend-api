import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ReviewEntity } from '@/module/review/entity/review.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { UserEntity } from '@/module/user/entity/user.entity';

export default class ReviewSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const reviewRepository = dataSource.getRepository(ReviewEntity);
        const tourRepository = dataSource.getRepository(TourEntity);
        const userRepository = dataSource.getRepository(UserEntity);

        const tours = await tourRepository.find({
            where: { status: 'active', is_visible: true },
        });
        const customers = await userRepository.find({
            where: { role: { name: 'customer' } },
        });

        if (tours.length === 0 || customers.length === 0) {
            console.log(
                '⚠️ No tours or customers found, skipping review seeder',
            );
            return;
        }

        const reviewData = [
            {
                titles: [
                    'Amazing experience!',
                    'Highly recommended tour',
                    'Best tour ever!',
                    'Unforgettable memories',
                    'Perfect day trip',
                ],
                contents: [
                    'This tour exceeded all my expectations. The guide was knowledgeable and friendly, making the experience truly memorable. Everything was well-organized and we had plenty of time at each location.',
                    'I highly recommend this tour to anyone visiting Vietnam. The itinerary was perfect, food was delicious, and our group had a wonderful time together. Great value for money!',
                    "One of the best tours I've ever taken. The scenery was breathtaking and the guide shared so many interesting stories about the local culture and history.",
                    'What an incredible experience! From start to finish, everything was professionally managed. The tour operator went above and beyond to ensure we had a great time.',
                    'This tour was the highlight of my Vietnam trip. Well-paced, informative, and lots of fun. The lunch provided was excellent and authentic.',
                ],
                rating: 5,
            },
            {
                titles: [
                    'Great tour with minor issues',
                    'Good experience overall',
                    'Worth the price',
                    'Enjoyable day',
                    'Nice tour',
                ],
                contents: [
                    'Overall a great tour. The guide was good and the sights were beautiful. Only minor issue was the timing felt a bit rushed at some locations, but still enjoyed it very much.',
                    'Had a good time on this tour. The guide was friendly and the group size was perfect. Would have liked more time for photos but otherwise satisfied.',
                    'Solid tour with good organization. The transportation was comfortable and punctual. Guide was helpful and answered all our questions.',
                    'Nice experience exploring the area. Food was tasty and the activities were interesting. Some parts could be improved but overall worth it.',
                ],
                rating: 4,
            },
            {
                titles: [
                    'Decent tour',
                    'Average experience',
                    'Good but not great',
                    'It was okay',
                ],
                contents: [
                    'The tour was decent. Some highlights were great but other parts felt underwhelming. The guide tried their best but seemed inexperienced.',
                    'Average tour overall. Nothing spectacular but nothing terrible either. Met my basic expectations.',
                    'It was okay. Some parts were enjoyable but I expected more based on the description and reviews.',
                ],
                rating: 3,
            },
            {
                titles: [
                    'Disappointed',
                    'Below expectations',
                    'Could be better',
                ],
                contents: [
                    "Unfortunately this tour didn't meet my expectations. The guide seemed disinterested and we spent too much time at tourist traps.",
                    'Not what I expected based on the description. Felt rushed and several promised activities were skipped.',
                ],
                rating: 2,
            },
        ];

        let sortNo = 1;
        for (const tour of tours) {
            // Add 3-8 reviews per tour
            const numReviews = Math.floor(Math.random() * 6) + 3;

            for (let i = 0; i < numReviews; i++) {
                const user =
                    customers[Math.floor(Math.random() * customers.length)];

                // Weight towards higher ratings
                let ratingCategory;
                const rand = Math.random();
                if (rand > 0.8) {
                    ratingCategory = reviewData[3]; // 2 stars
                } else if (rand > 0.6) {
                    ratingCategory = reviewData[2]; // 3 stars
                } else if (rand > 0.3) {
                    ratingCategory = reviewData[1]; // 4 stars
                } else {
                    ratingCategory = reviewData[0]; // 5 stars
                }

                const title =
                    ratingCategory.titles[
                        Math.floor(Math.random() * ratingCategory.titles.length)
                    ];
                const content =
                    ratingCategory.contents[
                        Math.floor(
                            Math.random() * ratingCategory.contents.length,
                        )
                    ];
                const rating = ratingCategory.rating;

                // Determine status - most approved, some pending
                let status: 'approved' | 'pending' | 'rejected' = 'approved';
                if (Math.random() > 0.85) {
                    status = 'pending';
                } else if (Math.random() > 0.95) {
                    status = 'rejected';
                }

                const exists = await reviewRepository.findOne({
                    where: {
                        tour: { id: tour.id },
                        user: { id: user.id },
                        title: title,
                    },
                });

                if (!exists) {
                    await reviewRepository.save(
                        reviewRepository.create({
                            title: title,
                            rating: rating,
                            content: content,
                            sort_no: status === 'approved' ? sortNo++ : null,
                            status: status,
                            tour: tour,
                            user: user,
                        } as any),
                    );
                }
            }
        }

        // Update tour ratings based on approved reviews
        for (const tour of tours) {
            const approvedReviews = await reviewRepository.find({
                where: { tour: { id: tour.id }, status: 'approved' },
            });

            if (approvedReviews.length > 0) {
                const avgRating =
                    approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
                    approvedReviews.length;
                tour.score_rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
                await tourRepository.save(tour);
            }
        }

        console.log('Review seeded');
    }
}

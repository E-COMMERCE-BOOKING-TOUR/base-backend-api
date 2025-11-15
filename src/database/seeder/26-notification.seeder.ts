import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { NotificationEntity } from '@/module/user/entity/notification.entity';
import { UserEntity } from '@/module/user/entity/user.entity';

export default class NotificationSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const notificationRepository = dataSource.getRepository(NotificationEntity);
        const userRepository = dataSource.getRepository(UserEntity);

        const customers = await userRepository.find({
            where: { role: { name: 'customer' } },
        });

        const allUsers = await userRepository.find();

        if (customers.length === 0) {
            console.log('⚠️ No users found, skipping notification seeder');
            return;
        }

        const notifications = [
            // System notifications for all users
            {
                title: 'Welcome to BookinTour!',
                description: 'Thank you for joining BookinTour. Explore amazing tours and create unforgettable memories!',
                type: 'welcome',
                is_error: false,
                is_user: true,
                users: allUsers,
            },
            {
                title: 'New Feature: Virtual Tour Preview',
                description: 'Check out our new virtual tour preview feature! Now you can explore destinations before booking.',
                type: 'feature',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 5),
            },
            {
                title: 'Summer Sale - Up to 30% Off',
                description: 'Don\'t miss our summer sale! Book your dream vacation with up to 30% discount on selected tours.',
                type: 'promotion',
                is_error: false,
                is_user: true,
                users: customers,
            },
            {
                title: 'Payment Successful',
                description: 'Your payment has been processed successfully. Booking confirmation has been sent to your email.',
                type: 'payment',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 8),
            },
            {
                title: 'Booking Confirmed',
                description: 'Your tour booking has been confirmed! Get ready for an amazing experience.',
                type: 'booking',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 8),
            },
            {
                title: 'Tour Reminder',
                description: 'Your tour starts tomorrow! Please arrive 15 minutes before departure time.',
                type: 'reminder',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 3),
            },
            {
                title: 'Review Your Recent Tour',
                description: 'How was your tour? Share your experience and help other travelers!',
                type: 'review',
                is_error: false,
                is_user: true,
                users: customers.slice(2, 7),
            },
            {
                title: 'Payment Failed',
                description: 'We couldn\'t process your payment. Please check your payment details and try again.',
                type: 'payment',
                is_error: true,
                is_user: true,
                users: customers.slice(10, 11),
            },
            {
                title: 'Booking Cancelled',
                description: 'Your booking has been cancelled. Refund will be processed within 5-7 business days.',
                type: 'booking',
                is_error: false,
                is_user: true,
                users: customers.slice(11, 13),
            },
            {
                title: 'New Tours Added in Your Favorite Destination',
                description: 'We\'ve added new exciting tours in destinations you\'ve shown interest in. Check them out!',
                type: 'recommendation',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 5),
            },
            {
                title: 'Complete Your Profile',
                description: 'Complete your profile to get personalized tour recommendations and special offers.',
                type: 'profile',
                is_error: false,
                is_user: true,
                users: customers.slice(5, 8),
            },
            {
                title: 'Price Drop Alert!',
                description: 'Good news! The price of a tour in your wishlist has dropped. Book now before it\'s gone!',
                type: 'alert',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 4),
            },
            {
                title: 'Tour Itinerary Updated',
                description: 'There has been a minor change to your tour itinerary. Please check the updated details.',
                type: 'update',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 2),
            },
            {
                title: 'Limited Seats Available',
                description: 'Hurry! Only 3 seats left for your selected tour date. Book now to secure your spot!',
                type: 'alert',
                is_error: false,
                is_user: true,
                users: customers.slice(3, 6),
            },
            {
                title: 'Earn Rewards Points',
                description: 'You\'ve earned 500 reward points! Use them on your next booking for exclusive discounts.',
                type: 'reward',
                is_error: false,
                is_user: true,
                users: customers.slice(0, 8),
            },
            // System-wide announcements
            {
                title: 'System Maintenance Scheduled',
                description: 'We will be performing system maintenance on Sunday, 2:00 AM - 4:00 AM. Service may be temporarily unavailable.',
                type: 'maintenance',
                is_error: false,
                is_user: false,
                users: allUsers,
            },
            {
                title: 'New Cancellation Policy',
                description: 'Our cancellation policy has been updated to be more flexible. Check the new terms for your upcoming bookings.',
                type: 'policy',
                is_error: false,
                is_user: false,
                users: allUsers,
            },
            {
                title: 'Holiday Season Special Offers',
                description: 'Celebrate the holidays with our special tour packages. Early bird discounts available!',
                type: 'promotion',
                is_error: false,
                is_user: false,
                users: customers,
            },
        ];

        for (const notification of notifications) {
            const exists = await notificationRepository.findOne({
                where: { title: notification.title },
            });
            if (!exists) {
                await notificationRepository.save(notificationRepository.create(notification));
            }
        }

        console.log('Notification seeded');
    }
}


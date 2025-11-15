import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ArticleEntity } from '@/module/article/entity/article.entity';
import { UserEntity } from '@/module/user/entity/user.entity';

export default class ArticleSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const articleRepository = dataSource.getRepository(ArticleEntity);
        const userRepository = dataSource.getRepository(UserEntity);

        // Get content managers and admin users
        const authors = await userRepository.find({
            where: [
                { role: { name: 'admin' } },
                { role: { name: 'content_manager' } },
            ],
        });

        if (authors.length === 0) {
            console.log('⚠️ No authors found, skipping article seeder');
            return;
        }

        const articles = [
            {
                title: 'Top 10 Must-Visit Destinations in Vietnam',
                content: `<h2>Discover the beauty of Vietnam</h2>
                <p>Vietnam is a country of breathtaking natural beauty and cultural complexities. From bustling cities to serene countryside, here are the top 10 destinations you must visit.</p>
                <h3>1. Halong Bay</h3>
                <p>The magnificent UNESCO World Heritage site features thousands of limestone karsts and isles.</p>
                <h3>2. Hoi An Ancient Town</h3>
                <p>A beautifully preserved trading port with colorful lanterns lighting up the streets at night.</p>
                <h3>3. Sapa Rice Terraces</h3>
                <p>Marvel at the stunning layered rice fields carved into mountains by ethnic minorities.</p>
                <h3>4. Ho Chi Minh City</h3>
                <p>The bustling metropolis full of energy, history, and incredible street food.</p>
                <h3>5. Phong Nha-Ke Bang National Park</h3>
                <p>Home to some of the world's most spectacular caves including Son Doong.</p>
                <p>And 5 more amazing destinations waiting to be explored!</p>`,
                count_views: 1523,
                count_likes: 89,
                count_comments: 12,
                is_visible: true,
                user: authors[0],
            },
            {
                title: 'Vietnamese Street Food Guide: What to Eat and Where',
                content: `<h2>Embark on a culinary journey</h2>
                <p>Vietnamese cuisine is renowned worldwide for its fresh ingredients, minimal use of oil, and perfectly balanced flavors.</p>
                <h3>Pho - The National Dish</h3>
                <p>Start your day with a steaming bowl of pho, the iconic Vietnamese noodle soup.</p>
                <h3>Banh Mi - The Perfect Sandwich</h3>
                <p>French baguette meets Vietnamese flavors in this perfect street food.</p>
                <h3>Bun Cha - Hanoi's Specialty</h3>
                <p>Grilled pork with rice noodles, a must-try when visiting Hanoi.</p>
                <h3>Cao Lau - Hoi An's Unique Dish</h3>
                <p>Only found in Hoi An, made with water from ancient Cham wells.</p>
                <p>Don't forget to try egg coffee, fresh spring rolls, and coconut ice cream!</p>`,
                count_views: 2341,
                count_likes: 156,
                count_comments: 24,
                is_visible: true,
                user: authors[Math.min(1, authors.length - 1)],
            },
            {
                title: 'Planning Your First Trip to Vietnam: Essential Tips',
                content: `<h2>Everything you need to know</h2>
                <p>Planning your first trip to Vietnam can be overwhelming. Here are essential tips to make your journey smooth.</p>
                <h3>Best Time to Visit</h3>
                <p>Vietnam has diverse climates. Generally, November to April offers pleasant weather nationwide.</p>
                <h3>Visa Requirements</h3>
                <p>Check if you need a visa. Many countries can enter visa-free for 15-30 days.</p>
                <h3>Currency and Money</h3>
                <p>Vietnamese Dong (VND) is the currency. ATMs are widely available in cities.</p>
                <h3>Transportation</h3>
                <p>Domestic flights are cheap. Trains offer scenic routes. Grab app works for taxis.</p>
                <h3>What to Pack</h3>
                <p>Light, breathable clothes, sunscreen, mosquito repellent, and comfortable walking shoes.</p>`,
                count_views: 3456,
                count_likes: 234,
                count_comments: 45,
                is_visible: true,
                user: authors[0],
            },
            {
                title: 'Hidden Gems: Off the Beaten Path in Vietnam',
                content: `<h2>Explore lesser-known destinations</h2>
                <p>While popular destinations are amazing, these hidden gems offer authentic experiences away from crowds.</p>
                <h3>Ha Giang Loop</h3>
                <p>The most spectacular motorbike route in Vietnam through dramatic mountain passes.</p>
                <h3>Ninh Binh</h3>
                <p>Halong Bay on land with limestone karsts, rice paddies, and ancient temples.</p>
                <h3>Con Dao Islands</h3>
                <p>Pristine beaches and excellent diving, once a prison island now a tropical paradise.</p>
                <h3>Pu Luong Nature Reserve</h3>
                <p>Stunning rice terraces and authentic homestays in ethnic minority villages.</p>`,
                count_views: 1876,
                count_likes: 142,
                count_comments: 18,
                is_visible: true,
                user: authors[Math.min(1, authors.length - 1)],
            },
            {
                title: 'Vietnam Coffee Culture: From Farm to Cup',
                content: `<h2>Discover Vietnam's coffee scene</h2>
                <p>Vietnam is the world's second-largest coffee exporter. The coffee culture here is unique and vibrant.</p>
                <h3>Ca Phe Sua Da - Iced Coffee with Condensed Milk</h3>
                <p>The signature Vietnamese coffee drink, sweet, strong, and refreshing.</p>
                <h3>Egg Coffee</h3>
                <p>A Hanoi invention combining coffee with whipped egg yolk for a creamy treat.</p>
                <h3>Coconut Coffee</h3>
                <p>Southern Vietnam's specialty with smooth coconut cream on espresso.</p>
                <h3>Coffee Regions</h3>
                <p>Visit Dalat's highlands where most Vietnamese coffee is grown.</p>`,
                count_views: 987,
                count_likes: 78,
                count_comments: 9,
                is_visible: true,
                user: authors[0],
            },
            {
                title: 'Beach Hopping in Vietnam: Sun, Sand, and Sea',
                content: `<h2>Vietnam's best beaches</h2>
                <p>With over 3,000 kilometers of coastline, Vietnam offers incredible beach destinations.</p>
                <h3>Phu Quoc</h3>
                <p>Vietnam's largest island with pristine beaches and luxury resorts.</p>
                <h3>Nha Trang</h3>
                <p>The party beach of Vietnam with water sports and vibrant nightlife.</p>
                <h3>Da Nang</h3>
                <p>Long stretches of clean sand perfect for surfing and relaxation.</p>
                <h3>Mui Ne</h3>
                <p>Famous for kitesurfing and dramatic red sand dunes.</p>`,
                count_views: 2145,
                count_likes: 167,
                count_comments: 21,
                is_visible: true,
                user: authors[Math.min(1, authors.length - 1)],
            },
            {
                title: 'Cultural Etiquette: Do\'s and Don\'ts in Vietnam',
                content: `<h2>Respecting Vietnamese culture</h2>
                <p>Understanding local customs will enhance your experience and show respect.</p>
                <h3>Greetings</h3>
                <p>A slight bow or nod is respectful. Handshakes are common in business.</p>
                <h3>Dress Code</h3>
                <p>Dress modestly when visiting temples. Remove shoes before entering homes.</p>
                <h3>Dining Etiquette</h3>
                <p>Wait for elders to start eating. Use both hands when giving or receiving items.</p>
                <h3>Photography</h3>
                <p>Always ask permission before photographing people, especially ethnic minorities.</p>`,
                count_views: 1234,
                count_likes: 91,
                count_comments: 14,
                is_visible: true,
                user: authors[0],
            },
            {
                title: 'Motorbike Adventures: Safely Exploring Vietnam on Two Wheels',
                content: `<h2>The ultimate freedom</h2>
                <p>Motorbike is the best way to explore Vietnam, offering flexibility and adventure.</p>
                <h3>Safety First</h3>
                <p>Always wear a helmet. Get international driving permit. Drive defensively.</p>
                <h3>Best Routes</h3>
                <p>Hai Van Pass, Ho Chi Minh Road, Ha Giang Loop, Mekong Delta.</p>
                <h3>What to Bring</h3>
                <p>Rain gear, sunscreen, first aid kit, phone mount, and backup battery.</p>
                <h3>Renting a Bike</h3>
                <p>Choose reputable rental shops. Check brakes, lights, and tires.</p>`,
                count_views: 1654,
                count_likes: 128,
                count_comments: 16,
                is_visible: true,
                user: authors[Math.min(1, authors.length - 1)],
            },
            {
                title: 'Budget Travel in Vietnam: Make Your Money Go Further',
                content: `<h2>Vietnam on a shoestring</h2>
                <p>Vietnam is one of the most budget-friendly destinations in Southeast Asia.</p>
                <h3>Accommodation</h3>
                <p>Hostels from $5/night, budget hotels $15-25, homestays for authentic experiences.</p>
                <h3>Food</h3>
                <p>Street food meals $1-3, local restaurants $3-7, water 50 cents.</p>
                <h3>Transportation</h3>
                <p>Local buses, overnight trains, and domestic flights during sales.</p>
                <h3>Free Activities</h3>
                <p>Beach days, temple visits, market wandering, and sunset watching.</p>`,
                count_views: 3123,
                count_likes: 245,
                count_comments: 38,
                is_visible: true,
                user: authors[0],
            },
            {
                title: 'Draft: Upcoming Travel Trends in Southeast Asia',
                content: `<h2>This article is being developed</h2>
                <p>Content coming soon about travel trends.</p>`,
                count_views: 23,
                count_likes: 2,
                count_comments: 0,
                is_visible: false,
                user: authors[Math.min(1, authors.length - 1)],
            },
        ];

        for (const article of articles) {
            const exists = await articleRepository.findOne({ where: { title: article.title } });
            if (!exists) {
                await articleRepository.save(articleRepository.create(article));
            }
        }

        console.log('Article seeded');
    }
}


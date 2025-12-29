import { MigrationInterface, QueryRunner } from 'typeorm';

export class PageStatic1766662747552 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO \`static_pages\` (\`title\`, \`slug\`, \`content\`, \`meta_title\`, \`meta_description\`) VALUES
            (
                'About Us', 
                'about-us', 
                '<section><h2>Connecting You to the Heart of Every Destination</h2><p>Welcome to <strong>TripConnect</strong>, your premier portal for authentic travel experiences. We believe that travel is more than just visiting places; it\\'s about building connections, discovering cultures, and creating memories that last a lifetime.</p><h3>Our Mission</h3><p>Our mission is to simplify travel planning while empowering local communities. We connect passionate travelers with expert-led tours and unique experiences that go beyond the typical tourist path.</p><h3>Why Choose TripConnect?</h3><ul><li><strong>Local Expertise:</strong> We partner with local guides who know their regions best.</li><li><strong>Seamless Booking:</strong> Our platform is designed for ease of use, ensuring a stress-free experience.</li><li><strong>Sustainable Travel:</strong> We promote responsible tourism that respects the environment and local traditions.</li></ul><h3>Our Story</h3><p>Founded by travelers, for travelers, TripConnect began with a simple idea: making professional-grade travel accessible to everyone. Today, we are proud to serve thousands of happy adventurers across the globe.</p></section>', 
                'About Us - TripConnect', 
                'Learn more about TripConnect, our mission, and core values.'
            ),
            (
                'FAQs', 
                'faqs', 
                '<section><h2>Frequently Asked Questions</h2><h3>1. How do I book a tour on TripConnect?</h3><p>Simply browse our destination or category list, select your preferred tour, choose your date and number of participants, and follow the checkout process.</p><h3>2. What payment methods are accepted?</h3><p>We accept major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment options depending on your region.</p><h3>3. Can I cancel or change my booking?</h3><p>Yes, most tours offer free cancellation up to 48 hours before the start time. Please refer to the specific cancellation policy on each tour page for details.</p><h3>4. How do I receive my booking confirmation?</h3><p>After a successful booking, you will receive an instant email confirmation with your voucher and meeting point details.</p><h3>5. Is travel insurance included?</h3><p>Travel insurance is not automatically included in most tour prices. We highly recommend purchasing your own comprehensive travel insurance.</p></section>', 
                'FAQs - TripConnect', 
                'Find answers to common questions about services, bookings, and payments at TripConnect.'
            ),
            (
                'Privacy Policy', 
                'privacy-policy', 
                '<section><h2>Privacy Policy</h2><p>Effective Date: December 25, 2025</p><p>At TripConnect, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as your name, email address, payment details, and travel preferences when you make a booking or create an account.</p><h3>How We Use Your Information</h3><p>We use your data to process bookings, provide customer support, and send you important updates or promotional offers (if you opted in).</p><h3>Data Security</h3><p>We implement industry-standard encryption and security measures to protect your information from unauthorized access.</p><h3>Sharing Your Information</h3><p>We only share necessary information with our trusted tour operators to fulfill your booking. We never sell your personal data to third parties.</p><h3>Your Rights</h3><p>You have the right to access, correct, or delete your personal data at any time. Simply contact us at support@tripconnect.com.</p></section>', 
                'Privacy Policy - TripConnect', 
                'TripConnect commitment to protecting user privacy and data.'
            ),
            (
                'Terms of Use', 
                'terms-of-use', 
                '<section><h2>Terms of Use</h2><p>Welcome to TripConnect. By accessing or using our services, you agree to comply with the following terms:</p><h3>Acceptance of Terms</h3><p>By using our website, you confirm that you are at least 18 years old and have the legal authority to enter into this agreement.</p><h3>Booking and Payment</h3><p>All bookings are subject to availability. Prices are listed in your selected currency and are inclusive of relevant taxes unless stated otherwise.</p><h3>User Responsibilities</h3><p>You are responsible for providing accurate information and maintaining the confidentiality of your account credentials.</p><h3>Limitation of Liability</h3><p>TripConnect acts as an intermediary between travelers and tour operators. We are not liable for any injuries, losses, or damages incurred during the tours themselves.</p><h3>Governing Law</h3><p>These terms are governed by the laws of the jurisdiction in which TripConnect is registered.</p></section>', 
                'Terms of Use - TripConnect', 
                'Detailed information about the terms and conditions of using TripConnect services.'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM \`static_pages\` WHERE \`slug\` IN ('about-us', 'faqs', 'privacy-policy', 'terms-of-use');`,
        );
    }
}

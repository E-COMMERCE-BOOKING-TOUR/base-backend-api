import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaymentInfomationEntity } from '../entity/paymentInfomation.entity';
import { UserEntity } from '../entity/user.entity';
import Stripe from 'stripe';
import { BookingEntity } from '@/module/booking/entity/booking.entity';
import { BookingStatus } from '@/module/booking/dto/booking.dto';

@Injectable()
export class UserPaymentService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(PaymentInfomationEntity)
        private readonly paymentInfoRepository: Repository<PaymentInfomationEntity>,
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    }

    async addPaymentCard(user: UserEntity, token: string) {
        console.log(user, token);
        try {
            // Create a Customer in Stripe to save the card
            // Note: In a real system, we should check if user already has a stripe_customer_id in DB
            const customer = await this.stripe.customers.create({
                email: user.email,
                source: token, // Attaches the card token as a source
            });

            // Retrieve the card details from the customer's default source
            const sourceId = customer.default_source as string;
            const source = await this.stripe.customers.retrieveSource(
                customer.id,
                sourceId,
            );

            if (source.object !== 'card') {
                throw new BadRequestException('Provided token is not a card');
            }

            // Type assertion for Card source properties
            const card = source as Stripe.Card;

            const entity = this.paymentInfoRepository.create({
                user: { id: user.id } as UserEntity,
                brand: card.brand,
                funding: card.funding,
                country: card.country,
                account_holder: card.name || user.username || 'Unknown',
                cvc_check: card.cvc_check,
                customer_id: customer.id,
                fingerprint: card.fingerprint,
                expiry_date: `${card.exp_month}/${card.exp_year}`,
                last4: card.last4,
            });

            const paymentInfo = await this.paymentInfoRepository.save(entity);
            // Get current booking waiting for payment and update payment information for booking
            const booking = await this.bookingRepository.findOne({
                where: {
                    user: { uuid: user.uuid },
                    status: In([
                        BookingStatus.pending_payment,
                        // BookingStatus.pending_confirm,
                        // BookingStatus.pending_info,
                    ]),
                },
                order: { id: 'DESC' },
            });

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            booking.payment_information = paymentInfo;
            await this.bookingRepository.save(booking);

            return { success: true };
        } catch (e) {
            throw new BadRequestException(
                e instanceof Error ? e.message : 'Failed to add payment card',
            );
        }
    }

    /**
     * Charge a Stripe Customer
     * @param customerId - Stripe Customer ID (stored in account_number)
     * @param amount - Amount in smallest currency unit (e.g., cents for USD, đồng for VND)
     * @param currency - Currency code (e.g., 'vnd', 'usd')
     */
    async chargeCustomer(
        customerId: string,
        amount: number,
        currency: string,
    ): Promise<Stripe.Charge> {
        try {
            const currencyCode = currency.toLowerCase();
            const zeroDecimalCurrencies = ['jpy', 'vnd', 'krw'];
            const stripeAmount = zeroDecimalCurrencies.includes(currencyCode)
                ? Math.round(amount)
                : Math.round(amount * 100);

            const charge = await this.stripe.charges.create({
                amount: stripeAmount,
                currency: currencyCode,
                customer: customerId,
                description: 'Tour Booking Payment',
            });
            return charge;
        } catch (e) {
            throw new BadRequestException(
                e instanceof Error ? e.message : 'Failed to process payment',
            );
        }
    }
}

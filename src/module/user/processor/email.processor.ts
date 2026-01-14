import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { BookingConfirmationData } from '../../mail/templates/booking-confirmation.template';
import { BookingStatusUpdateData } from '../../mail/templates/booking-status-update.template';

export const EMAIL_QUEUE = 'email';

export interface SendVerificationEmailJobData {
    email: string;
    fullName: string;
    verificationLink: string;
}

export interface SendBookingConfirmationJobData {
    email: string;
    data: BookingConfirmationData;
}

export interface SendBookingStatusUpdateJobData {
    email: string;
    data: BookingStatusUpdateData;
}

@Processor(EMAIL_QUEUE)
@Injectable()
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(
        job: Job<
            | SendVerificationEmailJobData
            | SendBookingConfirmationJobData
            | SendBookingStatusUpdateJobData
        >,
    ) {
        this.logger.debug(`Processing email job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'send-verification':
                return this.handleSendVerification(
                    job as Job<SendVerificationEmailJobData>,
                );
            case 'send-booking-confirmation':
                return this.handleSendBookingConfirmation(
                    job as Job<SendBookingConfirmationJobData>,
                );
            case 'send-booking-status-update':
                return this.handleSendBookingStatusUpdate(
                    job as Job<SendBookingStatusUpdateJobData>,
                );
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
                return { success: false, error: 'Unknown job type' };
        }
    }

    private async handleSendVerification(
        job: Job<SendVerificationEmailJobData>,
    ): Promise<{ success: boolean }> {
        const { email, fullName, verificationLink } = job.data;
        this.logger.log(`Sending verification email to ${email}`);

        try {
            await this.mailService.sendVerificationEmail(
                email,
                fullName,
                verificationLink,
            );
            this.logger.log(`Verification email sent to ${email}`);
            return { success: true };
        } catch (error) {
            this.logger.error(
                `Failed to send verification email to ${email}`,
                error,
            );
            throw error;
        }
    }

    private async handleSendBookingConfirmation(
        job: Job<SendBookingConfirmationJobData>,
    ): Promise<{ success: boolean }> {
        const { email, data } = job.data;
        this.logger.log(
            `Sending booking confirmation email to ${email} for booking #${data.bookingId}`,
        );

        try {
            await this.mailService.sendBookingConfirmationEmail(email, data);
            this.logger.log(`Booking confirmation email sent to ${email}`);
            return { success: true };
        } catch (error) {
            this.logger.error(
                `Failed to send booking confirmation email to ${email}`,
                error,
            );
            throw error;
        }
    }

    private async handleSendBookingStatusUpdate(
        job: Job<SendBookingStatusUpdateJobData>,
    ): Promise<{ success: boolean }> {
        const { email, data } = job.data;
        this.logger.log(
            `Sending booking status update email to ${email} for booking #${data.bookingId}`,
        );

        try {
            await this.mailService.sendBookingStatusUpdateEmail(email, data);
            this.logger.log(`Booking status update email sent to ${email}`);
            return { success: true };
        } catch (error) {
            this.logger.error(
                `Failed to send booking status update email to ${email}`,
                error,
            );
            throw error;
        }
    }
}

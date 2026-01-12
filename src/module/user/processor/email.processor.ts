import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';

export const EMAIL_QUEUE = 'email';

export interface SendVerificationEmailJobData {
    email: string;
    fullName: string;
    verificationLink: string;
}

@Processor(EMAIL_QUEUE)
@Injectable()
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job<SendVerificationEmailJobData>) {
        this.logger.debug(`Processing email job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'send-verification':
                return this.handleSendVerification(job);
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
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { forgotPasswordTemplate } from './templates/forgot-password.template';
import { emailVerificationTemplate } from './templates/email-verification.template';
import {
    bookingConfirmationTemplate,
    BookingConfirmationData,
} from './templates/booking-confirmation.template';
import {
    bookingStatusUpdateTemplate,
    BookingStatusUpdateData,
} from './templates/booking-status-update.template';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const dsn = this.configService.get<string>('MAILER_DSN');
        if (dsn) {
            this.transporter = nodemailer.createTransport(dsn);
        } else {
            // this.logger.warn('MAILER_DSN not found. Emails will not be sent.');
            throw new Error('MAILER_DSN not found. Emails cannot be sent.');
        }
    }

    async sendForgotPasswordEmail(
        to: string,
        fullName: string,
        resetLink: string,
    ) {
        const html = forgotPasswordTemplate(fullName, resetLink);
        await this.sendMail(to, 'Password Reset Instructions', html);
    }

    async sendVerificationEmail(
        to: string,
        fullName: string,
        verificationLink: string,
    ) {
        const html = emailVerificationTemplate(fullName, verificationLink);
        await this.sendMail(to, 'Verify Your Email Address', html);
    }

    async sendBookingConfirmationEmail(
        to: string,
        data: BookingConfirmationData,
    ) {
        const html = bookingConfirmationTemplate(data);
        await this.sendMail(to, `Booking Confirmation #${data.bookingId}`, html);
    }

    async sendBookingStatusUpdateEmail(
        to: string,
        data: BookingStatusUpdateData,
    ) {
        const html = bookingStatusUpdateTemplate(data);
        await this.sendMail(to, `Booking Update #${data.bookingId}`, html);
    }

    async sendMail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            this.logger.error('Transporter not initialized. Cannot send mail.');
            throw new Error('Email service not configured');
        }

        try {
            await this.transporter.sendMail({
                from: '"Booking Tour" <no-reply@booking-tour.com>',
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}`);
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${to}`,
                (error as Error).stack,
            );
            throw error;
        }
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { forgotPasswordTemplate } from './templates/forgot-password.template';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const dsn = this.configService.get<string>('MAILER_DSN');
        if (dsn) {
            this.transporter = nodemailer.createTransport(dsn);
        } else {
            this.logger.warn('MAILER_DSN not found. Emails will not be sent.');
        }
    }

    async sendForgotPasswordEmail(to: string, fullName: string, resetLink: string) {
        const html = forgotPasswordTemplate(fullName, resetLink);
        await this.sendMail(to, 'Hướng dẫn đặt lại mật khẩu', html);
    }

    async sendMail(to: string, subject: string, html: string) {
        if (!this.transporter) {
            this.logger.error('Transporter not initialized. Cannot send mail.');
            return;
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
            this.logger.error(`Failed to send email to ${to}`, error.stack);
            throw error;
        }
    }
}

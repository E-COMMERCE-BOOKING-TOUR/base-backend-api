import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { BookingStatus, PaymentStatus } from '../dto/booking.dto';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import * as crypto from 'crypto';

export interface VnpayConfig {
    vnp_TmnCode: string;
    vnp_HashSecret: string;
    vnp_Url: string;
    vnp_ReturnUrl: string;
    vnp_Api: string;  // API endpoint for refund/query
}

export interface VnpayPaymentResult {
    isSuccess: boolean;
    message: string;
    transactionNo?: string;
    bankCode?: string;
    amount?: number;
    orderInfo?: string;
    responseCode?: string;
}

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly config: VnpayConfig;

    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(PaymentInfomationEntity)
        private readonly paymentInfoRepository: Repository<PaymentInfomationEntity>,
    ) {
        // Validate required environment variables
        const vnpTmnCode = process.env.VNPAY_TMN_CODE;
        const vnpHashSecret = process.env.VNPAY_HASH_SECRET;
        const vnpUrl = process.env.VNPAY_URL;
        const vnpReturnUrl = process.env.VNPAY_RETURN_URL;
        const vnpApi = process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

        if (!vnpTmnCode || !vnpHashSecret || !vnpUrl || !vnpReturnUrl) {
            this.logger.warn(
                'VNPay configuration incomplete. Required env vars: VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL',
            );
        }

        this.config = {
            vnp_TmnCode: vnpTmnCode || '',
            vnp_HashSecret: vnpHashSecret || '',
            vnp_Url: vnpUrl || '',
            vnp_ReturnUrl: vnpReturnUrl || '',
            vnp_Api: vnpApi,
        };
    }

    /**
     * Create VNPay payment URL for a booking
     */
    async createPaymentUrl(
        bookingId: number,
        ipAddress: string,
        locale: string = 'vn',
    ): Promise<string> {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['currency'],
        });

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        const date = new Date();
        const createDate = this.formatDate(date);
        const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

        // VNPay requires amount * 100 (remove decimal places)
        const amount = Math.round(Number(booking.total_amount) * 100);

        // Create unique transaction reference: booking_id + timestamp
        const txnRef = `${bookingId}_${Date.now()}`;

        const vnpParams: Record<string, string | number> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.config.vnp_TmnCode,
            vnp_Locale: locale === 'en' ? 'en' : 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan booking ${bookingId}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount,
            vnp_ReturnUrl: this.config.vnp_ReturnUrl,
            vnp_IpAddr: ipAddress,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };

        // Sort parameters alphabetically
        const sortedParams = this.sortObject(vnpParams);

        // Create signature from NON-ENCODED data
        const signData = this.buildQueryString(sortedParams);
        this.logger.log(`VNPay signData: ${signData}`);

        const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        this.logger.log(`VNPay signature: ${signed}`);

        // Add signature to params
        sortedParams['vnp_SecureHash'] = signed;

        // Build final URL - VNPay requires NON-ENCODED URL
        const paymentUrl = `${this.config.vnp_Url}?${this.buildQueryString(sortedParams)}`;

        this.logger.log(`Created VNPay payment URL for booking ${bookingId}`);
        this.logger.log(`HashSecret first 8 chars: ${this.config.vnp_HashSecret.substring(0, 8)}`);

        return paymentUrl;
    }

    /**
     * Verify VNPay IPN callback and update booking
     */
    async verifyIpnCallback(
        vnpParams: Record<string, string>,
    ): Promise<{ RspCode: string; Message: string }> {
        const secureHash = vnpParams['vnp_SecureHash'];

        // Remove hash fields before verification
        const paramsToVerify = { ...vnpParams };
        delete paramsToVerify['vnp_SecureHash'];
        delete paramsToVerify['vnp_SecureHashType'];

        // Sort and create signature
        const sortedParams = this.sortObject(paramsToVerify);
        const signData = this.buildQueryString(sortedParams);
        const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Verify checksum
        if (secureHash !== signed) {
            this.logger.warn('VNPay IPN: Invalid checksum');
            return { RspCode: '97', Message: 'Fail checksum' };
        }

        // Extract booking ID from txnRef (format: bookingId_timestamp)
        const txnRef = vnpParams['vnp_TxnRef'];
        const bookingId = parseInt(txnRef.split('_')[0], 10);

        if (isNaN(bookingId)) {
            this.logger.warn(`VNPay IPN: Invalid txnRef format: ${txnRef}`);
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Find booking
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tour_inventory_hold', 'user', 'payment_information'],
        });

        if (!booking) {
            this.logger.warn(`VNPay IPN: Booking not found: ${bookingId}`);
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Check if already processed
        if (booking.payment_status === PaymentStatus.paid) {
            this.logger.log(`VNPay IPN: Booking ${bookingId} already paid`);
            return { RspCode: '02', Message: 'Order already confirmed' };
        }

        // Verify amount (VNPay returns amount * 100)
        const vnpAmount = parseInt(vnpParams['vnp_Amount'], 10) / 100;
        const bookingAmount = Number(booking.total_amount);

        if (Math.abs(vnpAmount - bookingAmount) > 1) {
            this.logger.warn(
                `VNPay IPN: Amount mismatch. Expected: ${bookingAmount}, Got: ${vnpAmount}`,
            );
            return { RspCode: '04', Message: 'Invalid amount' };
        }

        // Check response code
        const responseCode = vnpParams['vnp_ResponseCode'];

        if (responseCode === '00') {
            // Payment successful - update booking
            booking.status = BookingStatus.waiting_supplier;
            booking.payment_status = PaymentStatus.paid;

            // Save VNPay info to payment_information (like Stripe saves stripe_charge_id)
            if (booking.payment_information) {
                booking.payment_information.vnpay_transaction_no = vnpParams['vnp_TransactionNo'];
                booking.payment_information.vnpay_bank_code = vnpParams['vnp_BankCode'];
                booking.payment_information.vnpay_pay_date = vnpParams['vnp_PayDate'];
                await this.paymentInfoRepository.save(booking.payment_information);
            } else {
                // Create new payment_information if not exists
                const paymentInfo = this.paymentInfoRepository.create({
                    vnpay_transaction_no: vnpParams['vnp_TransactionNo'],
                    vnpay_bank_code: vnpParams['vnp_BankCode'],
                    vnpay_pay_date: vnpParams['vnp_PayDate'],
                    user: booking.user,
                });
                const savedPaymentInfo = await this.paymentInfoRepository.save(paymentInfo);
                booking.payment_information = savedPaymentInfo;
            }

            // Clear expiry
            if (booking.tour_inventory_hold) {
                booking.tour_inventory_hold.expires_at = null;
            }

            await this.bookingRepository.save(booking);

            this.logger.log(
                `VNPay IPN: Booking ${bookingId} payment successful. TransactionNo: ${vnpParams['vnp_TransactionNo']}`,
            );

            return { RspCode: '00', Message: 'Confirm Success' };
        } else {
            // Payment failed
            this.logger.warn(
                `VNPay IPN: Payment failed for booking ${bookingId}. ResponseCode: ${responseCode}`,
            );
            return { RspCode: '00', Message: 'Confirm Success' }; // Still return 00 to stop retry
        }
    }

    /**
     * Verify VNPay Return URL parameters
     */
    verifyReturnUrl(vnpParams: Record<string, string>): VnpayPaymentResult {
        const secureHash = vnpParams['vnp_SecureHash'];

        // Remove hash fields before verification
        const paramsToVerify = { ...vnpParams };
        delete paramsToVerify['vnp_SecureHash'];
        delete paramsToVerify['vnp_SecureHashType'];

        // Sort and create signature
        const sortedParams = this.sortObject(paramsToVerify);
        const signData = this.buildQueryString(sortedParams);
        this.logger.log(`verifyReturnUrl signData: ${signData}`);

        const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        this.logger.log(`verifyReturnUrl secureHash from VNPay: ${secureHash}`);
        this.logger.log(`verifyReturnUrl signed (computed): ${signed}`);

        // Verify checksum
        if (secureHash !== signed) {
            this.logger.warn('verifyReturnUrl: Signature mismatch!');
            return {
                isSuccess: false,
                message: 'Invalid signature',
                responseCode: '97',
            };
        }

        const responseCode = vnpParams['vnp_ResponseCode'];
        const transactionStatus = vnpParams['vnp_TransactionStatus'];

        if (responseCode === '00' && transactionStatus === '00') {
            return {
                isSuccess: true,
                message: 'Payment successful',
                transactionNo: vnpParams['vnp_TransactionNo'],
                bankCode: vnpParams['vnp_BankCode'],
                amount: parseInt(vnpParams['vnp_Amount'], 10) / 100,
                orderInfo: vnpParams['vnp_OrderInfo'],
                responseCode,
            };
        }

        return {
            isSuccess: false,
            message: this.getResponseMessage(responseCode),
            responseCode,
        };
    }

    /**
     * Update booking status on successful payment (called from return handler as fallback)
     * This handles cases where IPN can't reach the server (localhost/sandbox testing)
     */
    async updateBookingOnPaymentSuccess(
        bookingId: number,
        transactionNo: string,
        bankCode: string,
        payDate: string,
    ): Promise<void> {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tour_inventory_hold', 'user', 'payment_information'],
        });

        if (!booking) {
            this.logger.warn(`updateBookingOnPaymentSuccess: Booking ${bookingId} not found`);
            return;
        }

        // Check if already processed
        if (booking.payment_status === PaymentStatus.paid) {
            this.logger.log(`updateBookingOnPaymentSuccess: Booking ${bookingId} already paid`);
            return;
        }

        // Update booking status
        booking.status = BookingStatus.waiting_supplier;
        booking.payment_status = PaymentStatus.paid;

        // Save VNPay info to payment_information
        if (booking.payment_information) {
            booking.payment_information.vnpay_transaction_no = transactionNo;
            booking.payment_information.vnpay_bank_code = bankCode;
            booking.payment_information.vnpay_pay_date = payDate;
            await this.paymentInfoRepository.save(booking.payment_information);
        } else {
            // Create new payment_information if not exists
            const paymentInfo = this.paymentInfoRepository.create({
                vnpay_transaction_no: transactionNo,
                vnpay_bank_code: bankCode,
                vnpay_pay_date: payDate,
                user: booking.user,
            });
            const savedPaymentInfo = await this.paymentInfoRepository.save(paymentInfo);
            booking.payment_information = savedPaymentInfo;
        }

        // Clear expiry
        if (booking.tour_inventory_hold) {
            booking.tour_inventory_hold.expires_at = null;
        }

        await this.bookingRepository.save(booking);

        this.logger.log(
            `updateBookingOnPaymentSuccess: Booking ${bookingId} payment successful. TransactionNo: ${transactionNo}`,
        );
    }

    /**
     * Get booking ID from VNPay txnRef
     */
    getBookingIdFromTxnRef(txnRef: string): number | null {
        const parts = txnRef.split('_');
        if (parts.length >= 1) {
            const id = parseInt(parts[0], 10);
            return isNaN(id) ? null : id;
        }
        return null;
    }

    /**
     * Refund VNPay payment
     * @param txnRef - Original transaction reference (vnp_TxnRef)
     * @param transactionDate - Original payment date (vnp_PayDate format: YYYYMMDDHHmmss)
     * @param amount - Amount to refund (in VND)
     * @param transactionType - '02' for full refund, '03' for partial refund
     * @param createdBy - User who initiated the refund
     * @param ipAddress - IP address of the requester
     */
    async refundPayment(
        txnRef: string,
        transactionDate: string,
        amount: number,
        transactionType: '02' | '03' = '02',
        createdBy: string = 'admin',
        ipAddress: string = '127.0.0.1',
    ): Promise<{ success: boolean; message: string; data?: any }> {
        const date = new Date();
        const createDate = this.formatDate(date);
        const requestId = this.formatDate(date).slice(-6); // HHmmss

        // VNPay amount is in cents (multiply by 100)
        const vnpAmount = Math.round(amount * 100);

        // Build signature data string (pipe-separated, specific order required by VNPay)
        const signData = [
            requestId,
            '2.1.0',
            'refund',
            this.config.vnp_TmnCode,
            transactionType,
            txnRef,
            vnpAmount,
            '0', // vnp_TransactionNo - set to 0 as we don't have it
            transactionDate,
            createdBy,
            createDate,
            ipAddress,
            `Hoan tien GD ma: ${txnRef}`,
        ].join('|');

        const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
        const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const requestBody = {
            vnp_RequestId: requestId,
            vnp_Version: '2.1.0',
            vnp_Command: 'refund',
            vnp_TmnCode: this.config.vnp_TmnCode,
            vnp_TransactionType: transactionType,
            vnp_TxnRef: txnRef,
            vnp_Amount: vnpAmount,
            vnp_TransactionNo: '0',
            vnp_CreateBy: createdBy,
            vnp_OrderInfo: `Hoan tien GD ma: ${txnRef}`,
            vnp_TransactionDate: transactionDate,
            vnp_CreateDate: createDate,
            vnp_IpAddr: ipAddress,
            vnp_SecureHash: secureHash,
        };

        this.logger.log(`VNPay Refund request: ${JSON.stringify(requestBody)}`);

        try {
            const response = await fetch(this.config.vnp_Api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            this.logger.log(`VNPay Refund response: ${JSON.stringify(result)}`);

            if (result.vnp_ResponseCode === '00') {
                return {
                    success: true,
                    message: 'Refund successful',
                    data: result,
                };
            } else {
                return {
                    success: false,
                    message: `Refund failed: ${result.vnp_Message || 'Unknown error'}`,
                    data: result,
                };
            }
        } catch (error) {
            this.logger.error(`VNPay Refund error: ${error.message}`);
            return {
                success: false,
                message: `Refund error: ${error.message}`,
            };
        }
    }

    /**
     * Format date for VNPay (yyyyMMddHHmmss) in Vietnam timezone GMT+7
     * VNPay requires dates in Vietnam timezone
     */
    private formatDate(date: Date): string {
        // Convert to Vietnam timezone (UTC+7)
        const vnTimezone = 'Asia/Ho_Chi_Minh';
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: vnTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const parts = formatter.formatToParts(date);
        const getValue = (type: string) => parts.find(p => p.type === type)?.value || '00';

        return (
            getValue('year') +
            getValue('month') +
            getValue('day') +
            getValue('hour') +
            getValue('minute') +
            getValue('second')
        );
    }

    /**
     * Sort object keys alphabetically AND encode keys/values (VNPay requirement)
     * This matches the official VNPay sample code exactly
     */
    private sortObject(obj: Record<string, any>): Record<string, string> {
        const sorted: Record<string, string> = {};
        const str: string[] = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();

        for (let i = 0; i < str.length; i++) {
            const key = str[i];
            // Decode the key to get original, then get value and encode it
            const originalKey = decodeURIComponent(key);
            sorted[key] = encodeURIComponent(String(obj[originalKey])).replace(/%20/g, '+');
        }

        return sorted;
    }

    /**
     * Build query string from sorted/encoded params (no additional encoding needed)
     */
    private buildQueryString(params: Record<string, any>): string {
        return Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');
    }

    /**
     * Get human-readable message for VNPay response code
     */
    private getResponseMessage(code: string): string {
        const messages: Record<string, string> = {
            '00': 'Transaction successful',
            '07': 'Transaction suspected of fraud',
            '09': 'Card/Account not registered for Internet Banking',
            '10': 'Card/Account verification failed 3+ times',
            '11': 'Payment timeout',
            '12': 'Card/Account is locked',
            '13': 'Wrong OTP',
            '24': 'Transaction cancelled',
            '51': 'Insufficient balance',
            '65': 'Daily transaction limit exceeded',
            '75': 'Bank is under maintenance',
            '79': 'Wrong payment password too many times',
            '99': 'Unknown error',
        };
        return messages[code] || 'Unknown error';
    }
}

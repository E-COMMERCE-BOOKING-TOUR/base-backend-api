import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { VnpayService } from '../service/vnpay.service';

@ApiTags('VNPay')
@Controller('vnpay')
export class VnpayController {
    private readonly logger = new Logger(VnpayController.name);

    constructor(private readonly vnpayService: VnpayService) { }

    /**
     * VNPay IPN Callback (Server-to-Server)
     * This endpoint is called by VNPay to notify payment status
     * No authentication required - VNPay calls this directly
     */
    @Get('ipn')
    @ApiResponse({
        status: 200,
        description: 'VNPay IPN callback response',
    })
    async vnpayIpn(
        @Query() query: Record<string, string>,
    ): Promise<{ RspCode: string; Message: string }> {
        this.logger.log(`VNPay IPN received: ${JSON.stringify(query)}`);

        try {
            const result = await this.vnpayService.verifyIpnCallback(query);
            this.logger.log(`VNPay IPN response: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            this.logger.error(`VNPay IPN error: ${error.message}`);
            return { RspCode: '99', Message: 'Unknown error' };
        }
    }

    /**
     * VNPay Return URL
     * User is redirected here after completing payment on VNPay
     * This redirects the user to the frontend return page with result params
     */
    @Get('return')
    @ApiResponse({
        status: 302,
        description: 'Redirect to frontend with payment result',
    })
    async vnpayReturn(
        @Query() query: Record<string, string>,
        @Res() res: Response,
    ): Promise<void> {
        this.logger.log(`VNPay Return received: ${JSON.stringify(query)}`);

        try {
            const result = this.vnpayService.verifyReturnUrl(query);

            // Get frontend URL from environment or default
            const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;

            // If payment successful, update booking status (fallback for when IPN can't reach)
            if (result.isSuccess) {
                const txnRef = query['vnp_TxnRef'];
                const bookingId = this.vnpayService.getBookingIdFromTxnRef(txnRef);
                if (bookingId) {
                    await this.vnpayService.updateBookingOnPaymentSuccess(
                        bookingId,
                        query['vnp_TransactionNo'] || '',
                        query['vnp_BankCode'] || '',
                        query['vnp_PayDate'] || '',
                    );
                }
            }

            // Redirect to frontend with result parameters
            const redirectUrl = new URL(
                '/checkout/vnpay-return',
                frontendUrl,
            );
            redirectUrl.searchParams.set(
                'success',
                result.isSuccess ? 'true' : 'false',
            );
            redirectUrl.searchParams.set('code', result.responseCode || '99');

            if (result.isSuccess) {
                redirectUrl.searchParams.set(
                    'transactionNo',
                    result.transactionNo || '',
                );
                redirectUrl.searchParams.set(
                    'amount',
                    (result.amount || 0).toString(),
                );
            } else {
                redirectUrl.searchParams.set(
                    'message',
                    encodeURIComponent(result.message),
                );
            }

            // Get booking ID from txnRef
            const txnRef = query['vnp_TxnRef'];
            if (txnRef) {
                const bookingId =
                    this.vnpayService.getBookingIdFromTxnRef(txnRef);
                if (bookingId) {
                    redirectUrl.searchParams.set(
                        'bookingId',
                        bookingId.toString(),
                    );
                }
            }

            this.logger.log(`VNPay Return redirecting to: ${redirectUrl.toString()}`);
            res.redirect(redirectUrl.toString());
        } catch (error) {
            this.logger.error(`VNPay Return error: ${error.message}`);
            const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;
            res.redirect(
                `${frontendUrl}/checkout/vnpay-return?success=false&code=99&message=Unknown%20error`,
            );
        }
    }
}

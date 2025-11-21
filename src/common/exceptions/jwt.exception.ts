import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let status = exception.getStatus();

        let message = 'Token không hợp lệ';
        // TokenExpired
        if (exception.message.includes('TokenExpiredError')) {
            message = 'Token đã hết hạn';
            status = 419;
        }

        response.status(status).json({
            status: status,
            message: 'Lỗi Unauthorized: ' + message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}

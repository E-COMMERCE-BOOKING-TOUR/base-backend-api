import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTRefresh, RefreshPayload } from '../types';

export const JWT = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JWTRefresh | undefined => {
        const request = ctx.switchToHttp().getRequest<{
            headers: Record<string, string | string[]>;
            user?: any;
        }>();
        const authHeader = request.headers['authorization'];

        if (
            typeof authHeader === 'string' &&
            authHeader.startsWith('Bearer ')
        ) {
            return {
                tokenRefresh: authHeader.split(' ')[1],
                payload: request.user as RefreshPayload,
            };
        }
        return undefined;
    },
);

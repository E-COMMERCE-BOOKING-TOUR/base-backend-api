import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTRefresh } from '../types';

export const JWT = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JWTRefresh | undefined => {
        const request = ctx.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (authHeader && authHeader.startsWith('Bearer ')) {
            return { tokenRefresh: authHeader.split(' ')[1], payload: request.user };
        }
        return undefined;
    },
);

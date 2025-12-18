import { JwtModuleOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import type { StringValue } from "ms";

export const jwtConfig = (): JwtModuleOptions => {
    const expiresInEnv = process.env.JWT_EXPIRES_IN as StringValue;
    return {
        secret: process.env.JWT_SECRET_PRIVATEKEY,
        signOptions: {
            expiresIn: expiresInEnv,
            algorithm: 'HS256',
        },
    };
};

export const jwtRefreshTokenConfig = (): {
    secret: string;
    expiresIn: SignOptions;
} => {
    const expiresInEnv = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d';
    const expiresIn = /^\d+$/.test(expiresInEnv)
        ? parseInt(expiresInEnv, 10)
        : expiresInEnv;

    return {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
        expiresIn: {
            expiresIn: expiresIn as any,
            algorithm: 'HS256',
        },
    };
};

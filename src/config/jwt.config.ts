import { JwtModuleOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';

export const jwtConfig = (): JwtModuleOptions => ({
    privateKey: process.env.JWT_SECRET_PRIVATEKEY,
    publicKey: process.env.JWT_SECRET_PUBLICKEY,
    signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
        // algorithm: 'RS256',
    },
});

export const jwtRefreshTokenConfig = (): {
    secret: string;
    expiresIn: SignOptions;
} => ({
    secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    expiresIn: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
        // algorithm: 'RS256',
    },
});

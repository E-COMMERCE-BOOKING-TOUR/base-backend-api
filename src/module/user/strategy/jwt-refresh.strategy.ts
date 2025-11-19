import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshPayload } from '../types';
import { AuthService } from '../service/auth.service';
import { jwtRefreshTokenConfig } from '@/config/jwt.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtRefreshTokenConfig().secret,
        });
    }

    async validate(payload: RefreshPayload) {
        const user = await this.authService.validateUser(payload.uuid);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return payload;
    }
}

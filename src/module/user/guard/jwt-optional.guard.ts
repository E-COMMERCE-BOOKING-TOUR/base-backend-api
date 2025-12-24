import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // Return user if authenticated, else return null instead of throwing UnauthorizedException
        if (err || !user) {
            return null;
        }
        return user;
    }
}

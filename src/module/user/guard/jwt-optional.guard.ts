import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleRequest(err: any, user: any, _info: any): any {
        // Return user if authenticated, else return null instead of throwing UnauthorizedException
        if (err || !user) {
            return null;
        }
        return user;
    }
}

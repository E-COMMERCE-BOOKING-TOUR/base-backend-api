import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../types';
import { jwtConfig } from '@/config/jwt.config';
import { UserEntity } from '../entity/user.entity';
import { UserAuthSessionEntity } from '../entity/userAuthSession.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(UserAuthSessionEntity)
        private userAuthSessionRepository: Repository<UserAuthSessionEntity>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig().privateKey as string,
        });
    }

    async validate(payload: TokenPayload) {
        const { uuid } = payload;

        // Check session
        const session = await this.userAuthSessionRepository.findOne({
            where: { user_uid: uuid },
        });
        if (!session) {
            throw new UnauthorizedException();
        }

        const user = await this.userRepository.findOne({
            where: { uuid: uuid },
            relations: ['role.permissions'],
        });
        if (!user) {
            throw new UnauthorizedException();
        }

        return await user.toJSON();
    }
}

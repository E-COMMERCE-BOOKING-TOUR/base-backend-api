import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/module/user/entity/user.entity';
import { PurchaseContext, PurchaseStep } from '../types/index.interface';

@Injectable()
export class ValidateUserStep implements PurchaseStep {
    priority = 10;

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async execute(ctx: PurchaseContext): Promise<PurchaseContext> {
        const user = await this.userRepository.findOne({
            where: { uuid: ctx.userUuid },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            ...ctx,
            user,
        };
    }
}

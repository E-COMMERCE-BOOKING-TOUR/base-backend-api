import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionEntity } from '@/common/entity/division.entity';
import { UserDivisionController } from './controller/user-division.controller';
import { DivisionService } from './service/division.service';

@Module({
    imports: [TypeOrmModule.forFeature([DivisionEntity])],
    controllers: [UserDivisionController],
    providers: [DivisionService],
    exports: [DivisionService],
})
export class CommonModule { }

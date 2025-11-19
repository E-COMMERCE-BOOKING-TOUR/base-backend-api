import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionEntity } from '@/common/entity/division.entity';
import { UserDivisionController } from './controller/userDivision.controller';
import { UserDivisionService } from './service/userDivision.service';

@Module({
    imports: [TypeOrmModule.forFeature([DivisionEntity])],
    controllers: [UserDivisionController],
    providers: [UserDivisionService],
    exports: [UserDivisionService],
})
export class CommonModule {}

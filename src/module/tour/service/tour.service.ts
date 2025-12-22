import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourEntity } from '../entity/tour.entity';

export class TourService {
    constructor(
        @InjectRepository(TourEntity)
        private readonly tourRepository: Repository<TourEntity>,
    ) {}
}

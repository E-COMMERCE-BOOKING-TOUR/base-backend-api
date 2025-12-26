import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TourVariantEntity } from './tourVariant.entity';
import { TourPaxTypeEntity } from './tourPaxType.entity';

@Entity('tour_variant_pax_type_prices')
export class TourVariantPaxTypePriceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'float',
    })
    @ApiProperty({ description: 'Giá áp theo rule cho loại khách' })
    price: number;

    @ManyToOne(
        () => TourVariantEntity,
        (tour_variant) => tour_variant.tour_variant_pax_type_prices,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'tour_variant_id', referencedColumnName: 'id' })
    @ApiProperty({
        description: 'Biến thể tour',
        type: () => TourVariantEntity,
    })
    tour_variant: TourVariantEntity;

    @ManyToOne(
        () => TourPaxTypeEntity,
        (pax_type) => pax_type.tour_variant_pax_type_prices,
        {
            nullable: false,
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'pax_type_id', referencedColumnName: 'id' })
    @ApiProperty({ description: 'Loại khách', type: () => TourPaxTypeEntity })
    pax_type: TourPaxTypeEntity;
}

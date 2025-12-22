import { UserEntity } from '@/module/user/entity/user.entity';
import { TourVariantEntity } from '@/module/tour/entity/tourVariant.entity';
import { TourEntity } from '@/module/tour/entity/tour.entity';
import { TourSessionEntity } from '@/module/tour/entity/tourSession.entity';
import { TourInventoryHoldEntity } from '@/module/tour/entity/tourInventoryHold.entity';
import { PaymentInfomationEntity } from '@/module/user/entity/paymentInfomation.entity';
import { BookingPaymentEntity } from '../../entity/bookingPayment.entity';
import { BookingItemEntity } from '../../entity/bookingItem.entity';
import { BookingEntity } from '../../entity/booking.entity';
import { TourPaxTypePriceDto } from '@/module/tour/dto/tour.dto';

export type PurchaseContext<
    M extends Record<string, unknown> = Record<string, unknown>,
> = {
    // Input
    userUuid: string;
    variantId: number;
    startDate: string;
    pax: Array<{ paxTypeId: number; quantity: number }>;
    tourSessionId?: number;

    // Resolved entities (populated by steps)
    user?: UserEntity;
    variant?: TourVariantEntity;
    tour?: TourEntity;
    session?: TourSessionEntity;
    inventoryHold?: TourInventoryHoldEntity;
    paymentInfo?: PaymentInfomationEntity;
    bookingPayment?: BookingPaymentEntity;
    prices?: TourPaxTypePriceDto[];

    // Calculated values
    totalAmount?: number;
    bookingItems?: BookingItemEntity[];

    // Final result
    booking?: BookingEntity;

    // Metadata for domain-specific logic
    meta?: M;
};

export interface PurchaseStep {
    priority?: number; // lower runs earlier
    execute(ctx: PurchaseContext): Promise<PurchaseContext> | PurchaseContext;
}

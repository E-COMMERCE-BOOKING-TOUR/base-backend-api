export type PriceLine = {
    id: string;
    amount: number;
    description?: string;
    meta?: Record<string, unknown>;
};

// Default item shape for generic flows; can be overridden with a custom type per domain.
export type PriceItem = { sku: string; qty: number; unitPrice: number };

export type PriceContext<
    I = PriceItem,
    M extends Record<string, unknown> = Record<string, unknown>,
> = {
    // Optional list of chargeable items; leave undefined when a domain passes data via meta
    items?: I[];
    customer?: { id?: string; tier?: string };
    shippingAddress?: { country?: string; state?: string; zip?: string };
    coupons?: string[];
    // Accumulated price lines through pipeline
    breakdown: PriceLine[];
    // Arbitrary metadata for domain-specific pricing (e.g., tour entities, variants, rules)
    meta?: M;
};

export interface PriceStep {
    priority?: number; // lower runs earlier
    execute(ctx: PriceContext): Promise<PriceContext> | PriceContext;
}
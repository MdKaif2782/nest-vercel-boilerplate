export declare class CreateChallanDto {
    buyerPurchaseOrderId: string;
    items: ChallanItemDto[];
    dispatchDate?: Date;
    deliveryDate?: Date;
    status?: 'DRAFT' | 'DISPATCHED';
}
export declare class ChallanItemDto {
    inventoryId: string;
    quantity: number;
}
export declare class UpdateChallanStatusDto {
    status: 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED' | 'REJECTED';
}
export declare class DispatchBPODto {
    buyerPurchaseOrderId: string;
    status?: 'DISPATCHED';
}
export declare class BpoSummaryDto {
    id: string;
    poNumber: string;
    companyName: string;
    totalQuantity: number;
    dispatchedQuantity: number;
    remainingQuantity: number;
    orderedValue: number;
    dispatchedValue: number;
    hasChallan: boolean;
    challanStatus?: string;
    createdAt: Date;
}
export declare class GetChallansQueryDto {
    status?: string;
}

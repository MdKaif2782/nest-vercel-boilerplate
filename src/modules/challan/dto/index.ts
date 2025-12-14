export class CreateChallanDto {
  buyerPurchaseOrderId: string;
  items: ChallanItemDto[];
  dispatchDate?: Date;
  deliveryDate?: Date;
  status?: 'DRAFT' | 'DISPATCHED';
}

export class ChallanItemDto {
  inventoryId: string;
  quantity: number;
}

export class UpdateChallanStatusDto {
  status: 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED' | 'REJECTED';
}

export class DispatchBPODto {
  buyerPurchaseOrderId: string;
  status?: 'DISPATCHED';
}

export class BpoSummaryDto {
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

export class GetChallansQueryDto {
  status?: string;
}
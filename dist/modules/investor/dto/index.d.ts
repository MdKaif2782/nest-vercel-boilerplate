export declare class CreateInvestorDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
    bankAccount?: string;
    bankName?: string;
    isActive?: boolean;
}
export declare class UpdateInvestorDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    bankAccount?: string;
    bankName?: string;
    isActive?: boolean;
}
export declare class InvestorQueryDto {
    search?: string;
    page?: number;
    limit?: number;
}

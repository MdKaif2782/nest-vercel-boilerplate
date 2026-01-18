import PDFDocument from 'pdfkit';
export declare const COMPANY_INFO: {
    name: string;
    address1: string;
    address2: string;
    phones: string;
    emails: string;
};
export interface LetterheadOptions {
    doc: typeof PDFDocument.prototype;
    title: string;
    includeDate?: boolean;
}
export declare function addLetterhead(options: LetterheadOptions): number;
export declare function formatCurrency(amount: number): string;
export declare function formatDate(date: Date | string): string;

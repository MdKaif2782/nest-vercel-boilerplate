// src/modules/pdf/letterhead.util.ts
import PDFDocument from 'pdfkit';

export const COMPANY_INFO = {
  name: 'Genuine Stationers & Gift Corner',
  address1: '169/C Kalabagan (Old), 94/1 Green Road (New) Staff Colony',
  address2: 'Kalabagan 2nd Lane, Dhanmondi, Dhaka- 1205',
  phones: '+88-02-9114774 | +88 01711-560963, +88 01971-560963',
  emails: 'gsgcreza@gmail.com, gmsreza87@yahoo.com',
};

export interface LetterheadOptions {
  doc: typeof PDFDocument.prototype;
  title: string;
  includeDate?: boolean;
}

export function addLetterhead(options: LetterheadOptions): number {
  const { doc, title, includeDate = true } = options;
  
  // Save current position
  const startY = doc.y;
  
  // Company Name - Bold and larger
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text(COMPANY_INFO.name, { align: 'center' });
  
  doc.moveDown(0.3);
  
  // Address lines
  doc.fontSize(10)
     .font('Helvetica')
     .text(COMPANY_INFO.address1, { align: 'center' });
  
  doc.text(COMPANY_INFO.address2, { align: 'center' });
  
  doc.moveDown(0.2);
  
  // Contact info
  doc.fontSize(9)
     .text(COMPANY_INFO.phones, { align: 'center' });
  
  doc.text(COMPANY_INFO.emails, { align: 'center' });
  
  doc.moveDown(0.5);
  
  // Horizontal line
  const lineY = doc.y;
  doc.moveTo(50, lineY)
     .lineTo(doc.page.width - 50, lineY)
     .stroke();
  
  doc.moveDown(1);
  
  // Title
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' });
  
  doc.moveDown(0.3);
  
  // Date if needed
  if (includeDate) {
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' });
  }
  
  doc.moveDown(0.8);
  
  // Return the Y position after letterhead
  return doc.y;
}

export function formatCurrency(amount: number): string {
  return `BDT ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB');
}

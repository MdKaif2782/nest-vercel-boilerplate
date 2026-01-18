"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPANY_INFO = void 0;
exports.addLetterhead = addLetterhead;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.COMPANY_INFO = {
    name: 'Genuine Stationers & Gift Corner',
    address1: '169/C Kalabagan (Old), 94/1 Green Road (New) Staff Colony',
    address2: 'Kalabagan 2nd Lane, Dhanmondi, Dhaka- 1205',
    phones: '+88-02-9114774 | +88 01711-560963, +88 01971-560963',
    emails: 'gsgcreza@gmail.com, gmsreza87@yahoo.com',
};
function addLetterhead(options) {
    const { doc, title, includeDate = true } = options;
    const startY = doc.y;
    doc.fontSize(16)
        .font('Helvetica-Bold')
        .text(exports.COMPANY_INFO.name, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10)
        .font('Helvetica')
        .text(exports.COMPANY_INFO.address1, { align: 'center' });
    doc.text(exports.COMPANY_INFO.address2, { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(9)
        .text(exports.COMPANY_INFO.phones, { align: 'center' });
    doc.text(exports.COMPANY_INFO.emails, { align: 'center' });
    doc.moveDown(0.5);
    const lineY = doc.y;
    doc.moveTo(50, lineY)
        .lineTo(doc.page.width - 50, lineY)
        .stroke();
    doc.moveDown(1);
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(title, { align: 'center' });
    doc.moveDown(0.3);
    if (includeDate) {
        doc.fontSize(10)
            .font('Helvetica')
            .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' });
    }
    doc.moveDown(0.8);
    return doc.y;
}
function formatCurrency(amount) {
    return `BDT ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB');
}
//# sourceMappingURL=letterhead.util.js.map
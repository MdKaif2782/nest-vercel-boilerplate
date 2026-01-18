"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailSalePdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const letterhead_util_1 = require("../pdf/letterhead.util");
const database_service_1 = require("../database/database.service");
let RetailSalePdfService = class RetailSalePdfService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSalesInvoice(retailSaleId) {
        return new Promise(async (resolve, reject) => {
            try {
                const retailSale = await this.prisma.retailSale.findUnique({
                    where: { id: retailSaleId },
                    include: {
                        items: {
                            include: {
                                inventory: {
                                    include: {
                                        purchaseOrder: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!retailSale) {
                    throw new Error('Retail sale not found');
                }
                const subtotal = retailSale.subtotal;
                const discount = retailSale.discount || 0;
                const tax = retailSale.tax || 0;
                const total = retailSale.totalAmount;
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                (0, letterhead_util_1.addLetterhead)({
                    doc,
                    title: 'SALES INVOICE',
                    includeDate: false
                });
                doc.moveDown(1);
                const leftX = 50;
                const rightX = 350;
                const currentY = doc.y;
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('INVOICE', leftX, currentY);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#666666');
                doc.text('Invoice Number:', leftX, currentY + 25);
                doc.font('Helvetica').fillColor('#000000');
                doc.text(retailSale.saleNumber, leftX + 80, currentY + 25);
                doc.font('Helvetica-Bold').fillColor('#666666');
                doc.text('Invoice Date:', leftX, currentY + 40);
                doc.font('Helvetica').fillColor('#000000');
                doc.text((0, letterhead_util_1.formatDate)(retailSale.saleDate), leftX + 80, currentY + 40);
                doc.font('Helvetica-Bold').fillColor('#666666');
                doc.text('Payment Method:', leftX, currentY + 55);
                doc.font('Helvetica').fillColor('#000000');
                doc.text(retailSale.paymentMethod, leftX + 80, currentY + 55);
                if (retailSale.reference) {
                    doc.font('Helvetica-Bold').fillColor('#666666');
                    doc.text('Reference:', leftX, currentY + 70);
                    doc.font('Helvetica').fillColor('#000000');
                    doc.text(retailSale.reference, leftX + 80, currentY + 70);
                }
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('BILL TO:', rightX, currentY + 10);
                doc.rect(rightX, currentY + 25, 192, retailSale.customerName ? 65 : 45)
                    .fillAndStroke('#F8F9FA', '#D0D0D0');
                if (retailSale.customerName) {
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
                    doc.text(retailSale.customerName.substring(0, 30), rightX + 10, currentY + 33, {
                        width: 172,
                        lineGap: 2
                    });
                    if (retailSale.customerPhone) {
                        doc.fontSize(9).font('Helvetica').fillColor('#555555');
                        doc.text(`Phone: ${retailSale.customerPhone}`, rightX + 10, currentY + 52);
                    }
                    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#777777');
                    doc.text('Retail Customer', rightX + 10, currentY + 72);
                }
                else {
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
                    doc.text('WALK-IN CUSTOMER', rightX + 10, currentY + 33);
                    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#777777');
                    doc.text('No customer information', rightX + 10, currentY + 50);
                }
                doc.y = Math.max(currentY + 90, doc.y);
                doc.moveDown(1);
                const tableTop = doc.y;
                doc.rect(50, tableTop, 495, 25).fill('#34495E');
                const columns = [
                    { name: '#', width: 25, x: 53 },
                    { name: 'ITEM DESCRIPTION', width: 180, x: 78 },
                    { name: 'CODE', width: 70, x: 258 },
                    { name: 'QTY', width: 45, x: 328 },
                    { name: 'UNIT PRICE', width: 75, x: 373 },
                    { name: 'TOTAL', width: 70, x: 448 }
                ];
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
                columns.forEach(col => {
                    doc.text(col.name, col.x, tableTop + 8, {
                        width: col.width,
                        align: ['QTY', 'UNIT PRICE', 'TOTAL'].includes(col.name) ? 'center' : 'left'
                    });
                });
                let rowY = tableTop + 30;
                retailSale.items.forEach((item, index) => {
                    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F7F9FC';
                    doc.rect(50, rowY, 495, 22).fill(bgColor);
                    doc.fontSize(9).font('Helvetica').fillColor('#2C3E50');
                    doc.text((index + 1).toString(), columns[0].x, rowY + 6, {
                        width: columns[0].width,
                        align: 'center'
                    });
                    const productName = item.inventory?.productName || 'N/A';
                    doc.text(productName.substring(0, 35), columns[1].x, rowY + 6, {
                        width: columns[1].width,
                        lineBreak: false,
                        ellipsis: true
                    });
                    const productCode = item.inventory?.productCode || 'N/A';
                    doc.text(productCode.substring(0, 12), columns[2].x, rowY + 6, {
                        width: columns[2].width,
                        lineBreak: false,
                        ellipsis: true
                    });
                    doc.text(item.quantity.toString(), columns[3].x, rowY + 6, {
                        width: columns[3].width,
                        align: 'center'
                    });
                    doc.text((0, letterhead_util_1.formatCurrency)(item.unitPrice), columns[4].x, rowY + 6, {
                        width: columns[4].width,
                        align: 'right'
                    });
                    doc.text((0, letterhead_util_1.formatCurrency)(item.totalPrice), columns[5].x, rowY + 6, {
                        width: columns[5].width,
                        align: 'right'
                    });
                    rowY += 22;
                    if (rowY > 700) {
                        doc.addPage();
                        rowY = 50;
                        doc.rect(50, rowY, 495, 25).fill('#34495E');
                        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
                        columns.forEach(col => {
                            doc.text(col.name, col.x, rowY + 8, {
                                width: col.width,
                                align: ['QTY', 'UNIT PRICE', 'TOTAL'].includes(col.name) ? 'center' : 'left'
                            });
                        });
                        rowY += 30;
                    }
                });
                doc.rect(50, rowY, 495, 2).fill('#34495E');
                doc.y = rowY + 10;
                doc.moveDown(1);
                const totalsX = 330;
                let totalsY = doc.y;
                const totalsWidth = 195;
                doc.rect(totalsX - 10, totalsY - 10, totalsWidth + 20, 115)
                    .fillAndStroke('#F7F9FC', '#D5DBDB');
                doc.fontSize(10).font('Helvetica').fillColor('#555555');
                doc.text('Subtotal:', totalsX, totalsY, { width: 80 });
                doc.font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text((0, letterhead_util_1.formatCurrency)(subtotal), totalsX + 85, totalsY, { width: 110, align: 'right' });
                totalsY += 20;
                if (discount > 0) {
                    doc.fontSize(10).font('Helvetica').fillColor('#555555');
                    doc.text('Discount:', totalsX, totalsY, { width: 80 });
                    doc.font('Helvetica-Bold').fillColor('#E74C3C');
                    doc.text(`-${(0, letterhead_util_1.formatCurrency)(discount)}`, totalsX + 85, totalsY, { width: 110, align: 'right' });
                    totalsY += 20;
                }
                if (tax > 0) {
                    doc.fontSize(10).font('Helvetica').fillColor('#555555');
                    doc.text('Tax:', totalsX, totalsY, { width: 80 });
                    doc.font('Helvetica-Bold').fillColor('#2C3E50');
                    doc.text((0, letterhead_util_1.formatCurrency)(tax), totalsX + 85, totalsY, { width: 110, align: 'right' });
                    totalsY += 20;
                }
                doc.moveTo(totalsX, totalsY)
                    .lineTo(totalsX + totalsWidth, totalsY)
                    .strokeColor('#34495E')
                    .lineWidth(1.5)
                    .stroke();
                totalsY += 12;
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('GRAND TOTAL:', totalsX, totalsY, { width: 80 });
                doc.fontSize(13);
                doc.text((0, letterhead_util_1.formatCurrency)(total), totalsX + 85, totalsY - 1, { width: 110, align: 'right' });
                totalsY += 28;
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#27AE60');
                doc.text('PAID', totalsX, totalsY);
                doc.fontSize(8).font('Helvetica').fillColor('#555555');
                doc.text(`via ${retailSale.paymentMethod}`, totalsX + 35, totalsY);
                doc.y = Math.max(totalsY + 30, doc.y);
                if (retailSale.notes) {
                    doc.moveDown(1.5);
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2C3E50');
                    doc.text('Additional Notes:', 50, doc.y);
                    doc.moveDown(0.5);
                    const notesY = doc.y;
                    doc.rect(50, notesY, 495, 45)
                        .fillAndStroke('#FFFBF0', '#E8C547');
                    doc.fontSize(9).font('Helvetica').fillColor('#5D4E00');
                    doc.text(retailSale.notes, 60, notesY + 10, {
                        width: 475,
                        align: 'left',
                        lineGap: 3
                    });
                    doc.y = notesY + 55;
                }
                doc.addPage();
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('PRODUCT DETAILS SUMMARY', { align: 'center', underline: true });
                doc.moveDown(1);
                const summaryColumns = [
                    { name: 'PRODUCT', width: 140, x: 53 },
                    { name: 'CODE', width: 75, x: 193 },
                    { name: 'QTY', width: 50, x: 268 },
                    { name: 'COST', width: 80, x: 318 },
                    { name: 'SELL', width: 80, x: 398 },
                    { name: 'PROFIT', width: 75, x: 478 }
                ];
                const summaryTop = doc.y;
                doc.rect(50, summaryTop, 503, 25).fill('#3498DB');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
                summaryColumns.forEach(col => {
                    doc.text(col.name, col.x, summaryTop + 8, {
                        width: col.width,
                        align: col.name === 'PRODUCT' ? 'left' : 'center'
                    });
                });
                let summaryY = summaryTop + 30;
                let totalProfit = 0;
                let totalCost = 0;
                let totalRevenue = 0;
                retailSale.items.forEach((item, index) => {
                    const costPrice = item.inventory?.purchasePrice || 0;
                    const sellPrice = item.unitPrice;
                    const quantity = item.quantity;
                    const profit = (sellPrice - costPrice) * quantity;
                    totalCost += costPrice * quantity;
                    totalRevenue += sellPrice * quantity;
                    totalProfit += profit;
                    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F7F9FC';
                    doc.rect(50, summaryY, 503, 22).fill(bgColor);
                    doc.fontSize(9).font('Helvetica').fillColor('#2C3E50');
                    doc.text(item.inventory?.productName?.substring(0, 22) || 'N/A', summaryColumns[0].x, summaryY + 6, {
                        width: summaryColumns[0].width,
                        lineBreak: false,
                        ellipsis: true
                    });
                    doc.text((item.inventory?.productCode || 'N/A').substring(0, 12), summaryColumns[1].x, summaryY + 6, {
                        width: summaryColumns[1].width,
                        align: 'center',
                        lineBreak: false,
                        ellipsis: true
                    });
                    doc.text(quantity.toString(), summaryColumns[2].x, summaryY + 6, {
                        width: summaryColumns[2].width,
                        align: 'center'
                    });
                    doc.text((0, letterhead_util_1.formatCurrency)(costPrice), summaryColumns[3].x, summaryY + 6, {
                        width: summaryColumns[3].width,
                        align: 'right'
                    });
                    doc.text((0, letterhead_util_1.formatCurrency)(sellPrice), summaryColumns[4].x, summaryY + 6, {
                        width: summaryColumns[4].width,
                        align: 'right'
                    });
                    const profitColor = profit >= 0 ? '#27AE60' : '#E74C3C';
                    doc.fillColor(profitColor).font('Helvetica-Bold');
                    doc.text((0, letterhead_util_1.formatCurrency)(profit), summaryColumns[5].x, summaryY + 6, {
                        width: summaryColumns[5].width,
                        align: 'right'
                    });
                    summaryY += 22;
                });
                summaryY += 10;
                doc.rect(50, summaryY, 503, 25).fill('#34495E');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
                doc.text('TOTALS:', summaryColumns[0].x, summaryY + 8, { width: summaryColumns[0].width });
                doc.text(retailSale.items.reduce((sum, item) => sum + item.quantity, 0).toString(), summaryColumns[2].x, summaryY + 8, { width: summaryColumns[2].width, align: 'center' });
                doc.text((0, letterhead_util_1.formatCurrency)(totalCost), summaryColumns[3].x, summaryY + 8, { width: summaryColumns[3].width, align: 'right' });
                doc.text((0, letterhead_util_1.formatCurrency)(totalRevenue), summaryColumns[4].x, summaryY + 8, { width: summaryColumns[4].width, align: 'right' });
                doc.text((0, letterhead_util_1.formatCurrency)(totalProfit), summaryColumns[5].x, summaryY + 8, { width: summaryColumns[5].width, align: 'right' });
                summaryY += 40;
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('PROFIT ANALYSIS', 50, summaryY);
                summaryY += 25;
                const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
                doc.fontSize(9).font('Helvetica').fillColor('#555555');
                doc.text(`Total Cost of Goods:`, 60, summaryY, { width: 150 });
                doc.font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text((0, letterhead_util_1.formatCurrency)(totalCost), 220, summaryY, { width: 120, align: 'right' });
                summaryY += 18;
                doc.font('Helvetica').fillColor('#555555');
                doc.text(`Total Revenue:`, 60, summaryY, { width: 150 });
                doc.font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text((0, letterhead_util_1.formatCurrency)(totalRevenue), 220, summaryY, { width: 120, align: 'right' });
                summaryY += 18;
                doc.font('Helvetica').fillColor('#555555');
                doc.text(`Total Profit:`, 60, summaryY, { width: 150 });
                doc.font('Helvetica-Bold').fillColor(totalProfit >= 0 ? '#229954' : '#C0392B');
                doc.text((0, letterhead_util_1.formatCurrency)(totalProfit), 220, summaryY, { width: 120, align: 'right' });
                summaryY += 18;
                doc.font('Helvetica').fillColor('#555555');
                doc.text(`Profit Margin:`, 60, summaryY, { width: 150 });
                doc.font('Helvetica-Bold').fillColor(profitMargin >= 20 ? '#229954' :
                    profitMargin >= 10 ? '#D68910' : '#C0392B');
                doc.text(`${profitMargin.toFixed(2)}%`, 220, summaryY, { width: 120, align: 'right' });
                doc.addPage();
                doc.fontSize(9).font('Helvetica').fillColor('#666666');
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('Thank You For Your Business!', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(9).font('Helvetica-Oblique');
                doc.text('We appreciate your trust in our products and services.', { align: 'center' });
                doc.moveDown(1);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('Contact Information', { align: 'center' });
                doc.moveDown(0.3);
                doc.fontSize(9).font('Helvetica');
                doc.text('Email: info@company.com | Phone: +1 (555) 123-4567', { align: 'center' });
                doc.text('Address: 123 Business Street, City, State 12345', { align: 'center' });
                doc.moveDown(1);
                doc.fontSize(8).font('Helvetica-Oblique').fillColor('#7F8C8D');
                doc.text('Terms & Conditions:', 50, doc.y);
                doc.moveDown(0.2);
                doc.font('Helvetica');
                const terms = [
                    '1. This is a computer-generated invoice and does not require a signature.',
                    '2. All sales are final unless defective products are returned within 7 days.',
                    '3. Warranty claims must be accompanied by original purchase receipt.',
                    '4. Prices are inclusive of all applicable taxes unless stated otherwise.',
                    '5. For any queries, please contact our customer service department.'
                ];
                terms.forEach(term => {
                    doc.text(term, 60, doc.y, { width: 480 });
                    doc.moveDown(0.3);
                });
                doc.moveDown(1.5);
                const summaryBoxY = doc.y;
                doc.rect(50, summaryBoxY, 495, 55).fillAndStroke('#F7F9FC', '#BDC3C7');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('INVOICE SUMMARY', 60, summaryBoxY + 10);
                doc.fontSize(8).font('Helvetica').fillColor('#2C3E50');
                doc.text(`Invoice Number: ${retailSale.saleNumber}`, 60, summaryBoxY + 28);
                doc.text(`Date: ${(0, letterhead_util_1.formatDate)(retailSale.saleDate)}`, 60, summaryBoxY + 40);
                doc.text(`Items Sold: ${retailSale.items.length}`, 280, summaryBoxY + 28);
                const customerName = (retailSale.customerName || 'Walk-in').substring(0, 25);
                doc.text(`Customer: ${customerName}`, 280, summaryBoxY + 40, { width: 150, lineBreak: false, ellipsis: true });
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#229954');
                doc.text(`Total: ${(0, letterhead_util_1.formatCurrency)(total)}`, 435, summaryBoxY + 34, { width: 100, align: 'right' });
                doc.end();
            }
            catch (error) {
                console.error('Error generating invoice:', error);
                reject(error);
            }
        });
    }
    async generateReceipt(retailSaleId) {
        return new Promise(async (resolve, reject) => {
            try {
                const retailSale = await this.prisma.retailSale.findUnique({
                    where: { id: retailSaleId },
                    include: {
                        items: {
                            include: {
                                inventory: true,
                            },
                        },
                    },
                });
                if (!retailSale) {
                    throw new Error('Retail sale not found');
                }
                const doc = new pdfkit_1.default({ margin: 25, size: 'A6' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                let currentY = 25;
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('SALES RECEIPT', 25, currentY, { align: 'center', width: 247 });
                currentY += 18;
                doc.fontSize(8).font('Helvetica').fillColor('#555555');
                doc.text('Thank you for your purchase!', 25, currentY, { align: 'center', width: 247 });
                currentY += 15;
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text(letterhead_util_1.COMPANY_INFO.name, 25, currentY, { align: 'center', width: 247 });
                currentY += 14;
                doc.fontSize(7).font('Helvetica').fillColor('#555555');
                doc.text(letterhead_util_1.COMPANY_INFO.address1, 25, currentY, { align: 'center', width: 247 });
                currentY += 10;
                doc.text(letterhead_util_1.COMPANY_INFO.address2, 25, currentY, { align: 'center', width: 247 });
                currentY += 10;
                doc.text(letterhead_util_1.COMPANY_INFO.phones, 25, currentY, { align: 'center', width: 247 });
                currentY += 10;
                doc.text(letterhead_util_1.COMPANY_INFO.emails, 25, currentY, { align: 'center', width: 247 });
                currentY += 12;
                doc.moveTo(25, currentY)
                    .lineTo(272, currentY)
                    .strokeColor('#CCCCCC')
                    .lineWidth(0.5)
                    .stroke();
                currentY += 10;
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text(`Receipt #: ${retailSale.saleNumber}`, 25, currentY, { width: 247 });
                currentY += 11;
                doc.text(`Date: ${(0, letterhead_util_1.formatDate)(retailSale.saleDate)}`, 25, currentY, { width: 247 });
                currentY += 11;
                doc.text(`Time: ${new Date(retailSale.saleDate).toLocaleTimeString()}`, 25, currentY, { width: 247 });
                currentY += 11;
                if (retailSale.customerName) {
                    doc.text(`Customer: ${retailSale.customerName.substring(0, 30)}`, 25, currentY, { width: 247 });
                    currentY += 11;
                }
                currentY += 4;
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('ITEMS PURCHASED', 25, currentY, { width: 247 });
                currentY += 12;
                doc.fontSize(7).font('Helvetica').fillColor('#333333');
                retailSale.items.forEach((item, index) => {
                    const productName = (item.inventory?.productName || 'Item').substring(0, 25);
                    const line = `${index + 1}. ${productName}`;
                    doc.text(line, 25, currentY, { width: 140, lineBreak: false });
                    const qtyPrice = `${item.quantity} x ${(0, letterhead_util_1.formatCurrency)(item.unitPrice)}`;
                    doc.text(qtyPrice, 165, currentY, { width: 107, align: 'right' });
                    currentY += 9;
                    const total = (0, letterhead_util_1.formatCurrency)(item.totalPrice);
                    doc.font('Helvetica-Bold');
                    doc.text(total, 165, currentY, { width: 107, align: 'right' });
                    doc.font('Helvetica');
                    currentY += 12;
                });
                currentY += 3;
                doc.moveTo(25, currentY)
                    .lineTo(272, currentY)
                    .strokeColor('#CCCCCC')
                    .lineWidth(0.5)
                    .stroke();
                currentY += 8;
                doc.fontSize(8).font('Helvetica').fillColor('#555555');
                doc.text('Subtotal:', 25, currentY, { width: 80 });
                doc.font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text((0, letterhead_util_1.formatCurrency)(retailSale.subtotal), 105, currentY, { width: 167, align: 'right' });
                currentY += 11;
                if (retailSale.discount > 0) {
                    doc.fontSize(8).font('Helvetica').fillColor('#555555');
                    doc.text('Discount:', 25, currentY, { width: 80 });
                    doc.font('Helvetica-Bold').fillColor('#E74C3C');
                    doc.text(`-${(0, letterhead_util_1.formatCurrency)(retailSale.discount)}`, 105, currentY, { width: 167, align: 'right' });
                    currentY += 11;
                }
                if (retailSale.tax > 0) {
                    doc.fontSize(8).font('Helvetica').fillColor('#555555');
                    doc.text('Tax:', 25, currentY, { width: 80 });
                    doc.font('Helvetica-Bold').fillColor('#2C3E50');
                    doc.text((0, letterhead_util_1.formatCurrency)(retailSale.tax), 105, currentY, { width: 167, align: 'right' });
                    currentY += 11;
                }
                currentY += 3;
                doc.moveTo(25, currentY)
                    .lineTo(272, currentY)
                    .strokeColor('#2C3E50')
                    .lineWidth(1)
                    .stroke();
                currentY += 8;
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#2C3E50');
                doc.text('TOTAL:', 25, currentY, { width: 80 });
                doc.fontSize(11);
                doc.text((0, letterhead_util_1.formatCurrency)(retailSale.totalAmount), 105, currentY - 1, { width: 167, align: 'right' });
                currentY += 16;
                doc.fontSize(8).font('Helvetica').fillColor('#555555');
                doc.text(`Payment: ${retailSale.paymentMethod}`, 25, currentY, { width: 247 });
                currentY += 11;
                if (retailSale.reference) {
                    doc.text(`Ref: ${retailSale.reference}`, 25, currentY, { width: 247 });
                    currentY += 11;
                }
                currentY += 8;
                doc.moveTo(25, currentY)
                    .lineTo(272, currentY)
                    .strokeColor('#CCCCCC')
                    .lineWidth(0.5)
                    .stroke();
                currentY += 10;
                doc.fontSize(7).font('Helvetica-Oblique').fillColor('#777777');
                doc.text('Thank you for shopping with us!', 25, currentY, { align: 'center', width: 247 });
                currentY += 9;
                doc.text('Keep this receipt for your records', 25, currentY, { align: 'center', width: 247 });
                currentY += 10;
                doc.fontSize(6);
                doc.text(new Date().toLocaleString(), 25, currentY, { align: 'center', width: 247 });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
};
exports.RetailSalePdfService = RetailSalePdfService;
exports.RetailSalePdfService = RetailSalePdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RetailSalePdfService);
//# sourceMappingURL=retail-sale-pdf.service.js.map
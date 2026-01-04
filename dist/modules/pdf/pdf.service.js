"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const tmp = __importStar(require("tmp-promise"));
const database_service_1 = require("../database/database.service");
let PdfService = PdfService_1 = class PdfService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    async generateQuotationPdf(quotationId) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id: quotationId },
            include: {
                items: {
                    include: {
                        inventory: {
                            select: {
                                id: true,
                                productCode: true,
                                productName: true,
                                description: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!quotation) {
            throw new Error(`Quotation with ID ${quotationId} not found`);
        }
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        try {
            const latexContent = this.generateLatexQuotationTemplate(quotation);
            console.log(latexContent);
            const texFilePath = path.join(tmpDir.path, 'quotation.tex');
            await fs.writeFile(texFilePath, latexContent, 'utf8');
            await this.copyAssets(tmpDir.path);
            const pdfBuffer = await this.compileLatex(texFilePath, tmpDir.path);
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error('PDF generation failed:', error);
            throw error;
        }
        finally {
            await tmpDir.cleanup();
        }
    }
    generateLatexQuotationTemplate(quotation) {
        const escapeLatex = (text) => {
            if (!text)
                return '';
            return text
                .replace(/\\/g, '\\textbackslash{}')
                .replace(/#/g, '\\#')
                .replace(/\$/g, '\\$')
                .replace(/%/g, '\\%')
                .replace(/&/g, '\\&')
                .replace(/_/g, '\\_')
                .replace(/{/g, '\\{')
                .replace(/}/g, '\\}')
                .replace(/~/g, '\\textasciitilde{}')
                .replace(/\^/g, '\\textasciicircum{}')
                .replace(/</g, '\\textless{}')
                .replace(/>/g, '\\textgreater{}')
                .replace(/\n/g, ' ');
        };
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        };
        const truncateProductCode = (code, maxLength = 20) => {
            if (!code || code.length <= maxLength)
                return code;
            const firstPart = code.substring(0, 8);
            const lastPart = code.substring(code.length - 3);
            return `${firstPart}…${lastPart}`;
        };
        let itemsTableRows = '';
        let rowCounter = 1;
        let subTotal = 0;
        quotation.items.forEach((item) => {
            const amount = item.quantity * item.unitPrice;
            subTotal += amount;
            const productCode = escapeLatex(truncateProductCode(item.inventory.productCode || 'N/A'));
            const productName = escapeLatex(item.inventory.productName);
            const description = escapeLatex(item.inventory.description || '');
            itemsTableRows += `
${rowCounter} & ${productCode} & ${productName} & ${description} & ${item.quantity} & Pcs & ${formatCurrency(item.unitPrice)} & ${formatCurrency(amount)} \\\\
\\hline`;
            rowCounter++;
        });
        const taxAmount = quotation.taxAmount || 0;
        const totalAmount = quotation.totalAmount || subTotal + taxAmount;
        const moneyInWords = this.numberToWords(totalAmount);
        const validUntil = quotation.validUntil
            ? new Date(quotation.validUntil).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        const bodyContent = quotation.body?.replace(/\n/g, '\\\\[5pt] ') ||
            `Greetings from ${escapeLatex(quotation.companyName)}!\\\\[5pt] Hope you are doing well.\\\\[5pt] We would like to share our quotation for the above mentioned products and services for your kind consideration. The details are given below for easy reference and kind perusal:`;
        const deliveryDays = quotation.deliveryDays || 7;
        const deliveryTerms = escapeLatex(quotation.deliveryTerms || `Delivery: Within ${deliveryDays} days`);
        return `\\documentclass[10pt]{article}
\\usepackage[a4paper, margin=0.75in]{geometry}
\\usepackage{graphicx}
\\usepackage{array}
\\usepackage{longtable}
\\usepackage{multirow}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{tabularx}
\\usepackage{ragged2e}
\\usepackage{calc}
\\usepackage{datetime}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{fontspec}
\\usepackage{enumitem}
\\usepackage{colortbl}
\\usepackage{booktabs}
\\usepackage{lipsum}

% Set default font
\\setmainfont[Path=./, Extension=.ttf, BoldFont=Comfortaa-Bold]{Comfortaa-Regular}

% Color settings
\\definecolor{companycolor}{RGB}{0, 51, 102}
\\definecolor{tableheader}{RGB}{240, 240, 240}
\\definecolor{tablerow}{RGB}{250, 250, 250}

% Improved table column types
\\newcolumntype{P}[1]{>{\\raggedright\\arraybackslash}p{#1}}
\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}

% Better hyphenation
\\hyphenpenalty=10000
\\exhyphenpenalty=10000
\\tolerance=1
\\emergencystretch=\\maxdimen

% Header and footer settings
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\fancyfoot[C]{\\footnotesize Page \\thepage\\ of \\pageref{LastPage}}

% Custom commands
\\newcommand{\\quotationtitle}{Quotation}
\\newcommand{\\companyname}{Genuine Stationers \\& Gift Corner}
\\newcommand{\\companyaddress}{1/17/B Sikdar Real Estate, Road-6, Dhanmondi, Dhaka-1229}
\\newcommand{\\companyphoneone}{+8801711560963}
\\newcommand{\\companyphonetwo}{+8801971560963}
\\newcommand{\\companylandline}{+88 02 9114774}
\\newcommand{\\companyemailone}{gsgcreza@gmail.com}
\\newcommand{\\companyemailtwo}{gsmreza87@yahoo.com}

% Auto-generated quotation number
\\newcommand{\\quotationnumber}{${escapeLatex(quotation.quotationNumber)}}
\\newcommand{\\printdate}{\\today}

\\begin{document}

% =========================
% Company Header
% =========================
\\noindent
\\begin{minipage}[t]{\\textwidth}
\\vspace{0pt}

% -------------------------
% Left: Logo (fixed height)
% -------------------------
\\begin{minipage}[t]{0.35\\textwidth}
\\vspace{0pt}
\\includegraphics[width=0.8\\linewidth]{logo.jpg}
\\end{minipage}
\\hfill
% -------------------------
% Right: Name (top) + Details + QR
% -------------------------
\\begin{minipage}[t]{0.6\\textwidth}
\\vspace{0pt}

% Company Name (same level as logo)
{\\raggedleft
\\fontsize{16}{18}\\selectfont
\\textbf{\\textcolor{companycolor}{\\companyname}}
\\par}

\\vspace{4pt} % tight spacing under name

% -------- Text + QR row --------
\\noindent
\\begin{minipage}[t]{0.72\\linewidth}
\\vspace{0pt}
\\raggedleft
\\fontsize{7}{8}\\selectfont
\\linespread{1}\\selectfont

\\companyaddress\\\\[2pt]
Phone: \\companyphoneone, \\companyphonetwo\\\\[2pt]
\\companylandline\\\\[2pt]
\\companyemailone\\\\[2pt]
\\companyemailtwo
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.19\\linewidth}
\\vspace{0pt}
\\raggedleft
\\includegraphics[width=\\linewidth]{qr.jpg}
\\end{minipage}

\\end{minipage}

\\end{minipage}

\\vspace{10pt}

% Quotation title and info
\\noindent
\\begin{minipage}[t]{0.5\\textwidth}
\\textbf{To:}\\\\
${escapeLatex(quotation.contactPersonName || 'Valued Customer')}\\\\
${escapeLatex(quotation.companyName)}\\\\
${escapeLatex(quotation.companyAddress)}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
\\raggedleft
{\\Large\\textbf{\\textcolor{companycolor}{QUOTATION}}}\\\\[8pt]
\\textbf{Quotation No.:} ${escapeLatex(quotation.quotationNumber)}\\\\
\\textbf{Date:} \\today
\\end{minipage}

\\vspace{10pt}

\\noindent\\textbf{Subject:} ${escapeLatex(quotation.subject || 'Quotation for Products and Services')}

\\vspace{10pt}

Dear ${escapeLatex(quotation.contactPersonName?.split(' ')[0] || 'Sir/Madam')},

\\vspace{10pt}

${bodyContent}

\\vspace{15pt}

% Items Table - SIMPLE AND ROBUST
\\begin{center}
\\footnotesize
\\renewcommand{\\arraystretch}{1.4}
\\begin{longtable}{|c|>{\\raggedright\\arraybackslash}p{2cm}|>{\\raggedright\\arraybackslash}p{3cm}|>{\\raggedright\\arraybackslash}p{3cm}|c|c|r|r|}
\\hline
\\textbf{Sl.} & \\textbf{Item Code} & \\textbf{Item Name} & \\textbf{Description} & \\textbf{Qty} & \\textbf{Unit} & \\textbf{Rate (BDT)} & \\textbf{Amount (BDT)} \\\\
\\hline
${itemsTableRows}
\\multicolumn{7}{|r|}{\\textbf{Sub Total:}} & ${formatCurrency(subTotal)} \\\\\\hline
\\multicolumn{7}{|r|}{\\textbf{Tax:}} & ${formatCurrency(taxAmount)} \\\\\\hline
\\multicolumn{7}{|r|}{\\textbf{Total Amount:}} & \\textbf{${formatCurrency(totalAmount)}} \\\\\\hline
\\end{longtable}
\\end{center}

\\vspace{10pt}

\\noindent\\textbf{In Words:} ${moneyInWords}

\\vspace{15pt}

\\noindent\\textbf{Terms \\& Conditions:}
\\begin{itemize}
\\item ${escapeLatex(quotation.generalTerms || 'Price is Without VAT & TAX')}
\\item ${escapeLatex(quotation.paymentTerms || 'Payment: 50% advance, 50% on delivery')}
\\item ${deliveryTerms}
\\item This quotation is valid until ${validUntil}
\\item Prices are subject to change without prior notice
\\item Goods will be supplied as per quotation
\\end{itemize}

\\vspace{15pt}

We sincerely look forward to the opportunity of being entrusted partner of your esteemed organization to contribute in your success.

Please do not hesitate to communicate for any further information or clarification. We value the possibility of building a long-term professional relationship with your esteemed organization.

Thanks in advance.

\\vfill

\\begin{center}
\\begin{minipage}{0.45\\textwidth}
    \\centering
    \\vspace{1cm}
    \\rule{6cm}{0.5pt}\\\\
    Prepared by
\\end{minipage}
\\hfill
\\begin{minipage}{0.45\\textwidth}
    \\centering
    \\vspace{1cm}
    \\rule{6cm}{0.5pt}\\\\
    Approved by
\\end{minipage}
\\end{center}

\\end{document}`;
    }
    async copyAssets(tmpDirPath) {
        try {
            const assetLocations = [
                path.join(process.cwd(), 'assets'),
                path.join(process.cwd(), 'public'),
                path.join(process.cwd(), 'static'),
                path.join(process.cwd(), 'fonts'),
                path.join(__dirname, '..', '..', 'assets'),
                path.join(__dirname, '..', '..', 'public'),
            ];
            const assets = ['logo.jpg', 'qr.jpg', 'logo.png', 'qr.png'];
            for (const asset of assets) {
                let assetCopied = false;
                for (const location of assetLocations) {
                    const assetPath = path.join(location, asset);
                    if (await fs.pathExists(assetPath)) {
                        const destPath = path.join(tmpDirPath, asset);
                        await fs.copyFile(assetPath, destPath);
                        this.logger.log(`Copied asset: ${assetPath} to ${destPath}`);
                        assetCopied = true;
                        break;
                    }
                }
                if (!assetCopied && (asset.includes('logo') || asset.includes('qr'))) {
                    await this.createPlaceholderImage(path.join(tmpDirPath, asset));
                }
            }
            const fontFiles = ['Comfortaa-Regular.ttf', 'Comfortaa-Bold.ttf'];
            for (const font of fontFiles) {
                let fontCopied = false;
                for (const location of assetLocations) {
                    let fontPath = path.join(location, font);
                    if (await fs.pathExists(fontPath)) {
                        await fs.copyFile(fontPath, path.join(tmpDirPath, font));
                        this.logger.log(`Copied font: ${fontPath}`);
                        fontCopied = true;
                        break;
                    }
                    fontPath = path.join(location, 'fonts', font);
                    if (await fs.pathExists(fontPath)) {
                        await fs.copyFile(fontPath, path.join(tmpDirPath, font));
                        this.logger.log(`Copied font: ${fontPath}`);
                        fontCopied = true;
                        break;
                    }
                }
                if (!fontCopied) {
                    this.logger.warn(`Font not found: ${font}`);
                }
            }
        }
        catch (error) {
            this.logger.warn('Could not copy assets:', error.message);
        }
    }
    async createPlaceholderImage(filePath) {
        const isLogo = filePath.includes('logo');
        const svgContent = isLogo
            ? `<?xml version="1.0" encoding="UTF-8"?>
         <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
           <rect width="200" height="100" fill="#f0f0f0"/>
           <text x="100" y="50" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">LOGO</text>
         </svg>`
            : `<?xml version="1.0" encoding="UTF-8"?>
         <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
           <rect width="100" height="100" fill="#f0f0f0"/>
           <text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">QR</text>
         </svg>`;
        await fs.writeFile(filePath.replace('.jpg', '.svg').replace('.png', '.svg'), svgContent);
    }
    async compileLatex(texFilePath, outputDir) {
        const { execa } = await import("execa");
        try {
            await execa('xelatex', [
                '-interaction=nonstopmode',
                '-output-directory=' + outputDir,
                texFilePath,
            ], {
                cwd: outputDir,
                timeout: 30000,
            });
            await execa('xelatex', [
                '-interaction=nonstopmode',
                '-output-directory=' + outputDir,
                texFilePath,
            ], {
                cwd: outputDir,
                timeout: 60000,
            });
            const pdfPath = texFilePath.replace('.tex', '.pdf');
            if (!(await fs.pathExists(pdfPath))) {
                throw new Error(`PDF not generated at: ${pdfPath}`);
            }
            const pdfBuffer = await fs.readFile(pdfPath);
            this.logger.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);
            return pdfBuffer;
        }
        catch (error) {
            const logPath = texFilePath.replace('.tex', '.log');
            if (await fs.pathExists(logPath)) {
                const logContent = await fs.readFile(logPath, 'utf8');
                this.logger.error('LaTeX log content:', logContent);
            }
            throw new Error(`LaTeX compilation failed: ${error.message}`);
        }
    }
    async generateBillPdf(billId) {
        const bill = await this.prisma.bill.findUnique({
            where: { id: billId },
            include: {
                items: {
                    include: {
                        inventory: {
                            select: {
                                id: true,
                                productCode: true,
                                productName: true,
                                description: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: {
                        paymentDate: 'desc',
                    },
                },
                buyerPO: {
                    include: {
                        quotation: {
                            select: {
                                companyName: true,
                                companyAddress: true,
                                companyContact: true,
                                contactPersonName: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!bill) {
            throw new Error(`Bill with ID ${billId} not found`);
        }
        const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const billDue = bill.totalAmount - totalPaid;
        const status = billDue <= 0 ? 'PAID' : 'DUE';
        console.log(billDue);
        console.log(status);
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        try {
            const latexContent = this.generateLatexBillTemplate(bill, totalPaid, billDue, status);
            const texFilePath = path.join(tmpDir.path, 'bill.tex');
            await fs.writeFile(texFilePath, latexContent, 'utf8');
            await this.copyAssets(tmpDir.path);
            const pdfBuffer = await this.compileLatex(texFilePath, tmpDir.path);
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error('Bill PDF generation failed:', error);
            throw error;
        }
        finally {
            await tmpDir.cleanup();
        }
    }
    generateLatexBillTemplate(bill, totalPaid, billDue, status) {
        const escapeLatex = (text) => {
            if (!text)
                return '';
            return text
                .replace(/\\/g, '\\textbackslash{}')
                .replace(/#/g, '\\#')
                .replace(/\$/g, '\\$')
                .replace(/%/g, '\\%')
                .replace(/&/g, '\\&')
                .replace(/_/g, '\\_')
                .replace(/{/g, '\\{')
                .replace(/}/g, '\\}')
                .replace(/~/g, '\\textasciitilde{}')
                .replace(/\^/g, '\\textasciicircum{}')
                .replace(/</g, '\\textless{}')
                .replace(/>/g, '\\textgreater{}')
                .replace(/\n/g, '\\\\');
        };
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        };
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        };
        const truncateProductCode = (code, maxLength = 20) => {
            if (!code || code.length <= maxLength)
                return code;
            const firstPart = code.substring(0, 8);
            const lastPart = code.substring(code.length - 3);
            return `${firstPart}…${lastPart}`;
        };
        let itemsTableRows = '';
        let rowCounter = 1;
        bill.items.forEach((item) => {
            const productDescription = escapeLatex(item.productDescription || item.inventory.productName);
            const itemCode = escapeLatex(truncateProductCode(item.inventory.productCode || 'N/A'));
            itemsTableRows += `
${rowCounter} & ${itemCode} & ${productDescription} & ${item.quantity} & Pcs & ${formatCurrency(item.unitPrice)} & ${formatCurrency(item.totalPrice)} \\\\
\\hline`;
            rowCounter++;
        });
        const moneyInWords = this.numberToWords(bill.totalAmount);
        const latestPayment = bill.payments.length > 0 ? bill.payments[0] : null;
        const paymentHistory = latestPayment
            ? `Last Payment: ${formatCurrency(latestPayment.amount)} on ${formatDate(latestPayment.paymentDate)}`
            : 'No payments recorded';
        const previousDue = 0;
        const companyName = bill.buyerPO?.quotation?.companyName || 'Customer';
        const companyAddress = bill.buyerPO?.quotation?.companyAddress || 'Address not specified';
        const contactPerson = bill.buyerPO?.quotation?.contactPersonName || 'Contact Person';
        const companyContact = bill.buyerPO?.quotation?.companyContact || 'N/A';
        return `\\documentclass[8pt]{article}
\\usepackage[a4paper, margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{array}
\\usepackage{longtable}
\\usepackage{multirow}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{tabularx}
\\usepackage{ragged2e}
\\usepackage{calc}
\\usepackage{datetime}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{fontspec}

% Set Comfortaa font
\\setmainfont{Comfortaa}[
    Path = ./,
    Extension = .ttf,
    UprightFont = *-Regular,
    BoldFont = *-Bold,
    Scale = 0.9
]

% Color settings
\\definecolor{companycolor}{RGB}{0, 51, 102}
\\definecolor{paidcolor}{RGB}{76, 175, 80}    % Green for PAID
\\definecolor{duecolor}{RGB}{255, 235, 59}    % Yellow for DUE

% Header and footer settings
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\fancyfoot[C]{\\footnotesize Page \\thepage\\ of \\pageref{LastPage}}

% Custom commands
\\newcommand{\\invoicetitle}{Invoice}
\\newcommand{\\companyname}{Genuine Stationers \\& Gift Corner}
\\newcommand{\\companyaddress}{1/17/B Sikdar Real Estate, Road-6, Dhanmondi, Dhaka-1229}
\\newcommand{\\companyphoneone}{+8801711560963}
\\newcommand{\\companyphonetwo}{+8801971560963}
\\newcommand{\\companylandline}{+88 02 9114774}
\\newcommand{\\companyemailone}{gsgcreza@gmail.com}
\\newcommand{\\companyemailtwo}{gsmreza87@yahoo.com}

% Status command (PAID/DUE)
\\newcommand{\\invoicestatus}{${status}}

\\begin{document}

% =========================
% Company Header
% =========================
\\noindent
\\begin{minipage}[t]{\\textwidth}
\\vspace{0pt}

% -------------------------
% Left: Logo (fixed height)
% -------------------------
\\begin{minipage}[t]{0.35\\textwidth}
\\vspace{0pt}
\\includegraphics[width=0.8\\linewidth]{logo.jpg}
\\end{minipage}
\\hfill
% -------------------------
% Right: Name (top) + Details + QR
% -------------------------
\\begin{minipage}[t]{0.6\\textwidth}
\\vspace{0pt}

% Company Name (same level as logo)
{\\raggedleft
\\fontsize{16}{18}\\selectfont
\\textbf{\\textcolor{companycolor}{\\companyname}}
\\par}

\\vspace{4pt} % tight spacing under name

% -------- Text + QR row --------
\\noindent
\\begin{minipage}[t]{0.72\\linewidth}
\\vspace{0pt}
\\raggedleft
\\fontsize{7}{8}\\selectfont
\\linespread{1}\\selectfont

\\companyaddress\\\\[2pt]
Phone: \\companyphoneone, \\companyphonetwo\\\\[2pt]
\\companylandline\\\\[2pt]
\\companyemailone\\\\[2pt]
\\companyemailtwo
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.19\\linewidth}
\\vspace{0pt}
\\raggedleft
\\includegraphics[width=\\linewidth]{qr.jpg}
\\end{minipage}

\\end{minipage}

\\end{minipage}

\\vspace{20pt}

% Invoice title on top right
\\begin{flushright}
    {\\fontsize{16}{19.2}\\selectfont \\textbf{\\textcolor{companycolor}{\\invoicetitle}}}
\\end{flushright}

% Status indicator under Invoice title
\\begin{flushright}
    ${status === 'PAID' ? '\\colorbox{paidcolor}{\\textbf{PAID}}' : '\\colorbox{duecolor}{\\textbf{DUE}}'}
\\end{flushright}

\\vspace{5pt}

% Invoice header information (two-column layout)
\\begin{tabularx}{\\textwidth}{@{}Xr@{}}
    \\textbf{Invoice No.:} ${escapeLatex(bill.billNumber)} & \\textbf{VAT Reg. No.:} ${escapeLatex(bill.vatRegNo || 'N/A')} \\\\
    \\textbf{Customer Name:} \\textbf{${escapeLatex(companyName)}} & \\textbf{Code:} ${escapeLatex(bill.code || 'N/A')} \\\\
    \\textbf{Address:} ${escapeLatex(companyAddress)} & \\textbf{Vendor ID:} ${escapeLatex(bill.vendorNo || 'N/A')} \\\\
    \\hspace{2.5cm} ${escapeLatex(contactPerson)} & \\textbf{Purchase Order No.:} ${escapeLatex(bill.buyerPO?.poNumber || 'N/A')} \\\\
    \\textbf{Phone:} ${escapeLatex(companyContact)} & \\textbf{Purchase Order Date:} ${bill.buyerPO?.poDate ? formatDate(bill.buyerPO.poDate) : 'N/A'} \\\\
    \\textbf{Date:} ${formatDate(bill.billDate)} & \\textbf{Chalan No.:} [To be filled] \\\\
    & \\textbf{Print Date:} \\today \\\\
\\end{tabularx}

\\vspace{15pt}

% Items Table
\\begin{longtable}{|p{0.3cm}|p{2.5cm}|p{4.5cm}|p{1.2cm}|p{1cm}|p{1.8cm}|p{2.5cm}|}
    \\hline
    \\textbf{Sl.} & \\textbf{Item Code} & \\textbf{Item Name \\& Description} & \\textbf{Quantity} & \\textbf{Unit} & \\textbf{Rate (BDT)} & \\textbf{Amount (BDT)} \\\\
    \\hline
    \\endfirsthead
    
    \\hline
    \\textbf{Sl.} & \\textbf{Item Code} & \\textbf{Item Name \\& Description} & \\textbf{Quantity} & \\textbf{Unit} & \\textbf{Rate (BDT)} & \\textbf{Amount (BDT)} \\\\
    \\hline
    \\endhead
    
    \\hline
    \\multicolumn{7}{c}{\\textit{Continued on next page...}} \\\\
    \\endfoot
    
    \\hline
    \\endlastfoot
    
    ${itemsTableRows}
    
    % Total Row
    \\multicolumn{6}{r}{\\textbf{Total Amount:}} & \\textbf{${formatCurrency(bill.totalAmount)}} \\\\
    \\hline
\\end{longtable}

\\vspace{10pt}

% Amount in Words and Payment Summary
\\begin{tabularx}{\\textwidth}{@{}Xr@{}}
    \\textbf{In Words:} ${escapeLatex(moneyInWords)} & \\textbf{Total Amount:} ${formatCurrency(bill.totalAmount)} \\\\
    & \\textbf{Paid Amount:} ${formatCurrency(totalPaid)} \\\\
    & \\textbf{Bill Due:} ${formatCurrency(billDue)} \\\\
    & \\textbf{Previous Due:} ${formatCurrency(previousDue)} \\\\
    & \\textbf{Total Due:} ${formatCurrency(billDue + previousDue)} \\\\
\\end{tabularx}

\\vspace{5pt}

% Payment History
\\begin{tabularx}{\\textwidth}{@{}X@{}}
    \\small \\textbf{Payment History:} ${escapeLatex(paymentHistory)} \\\\
\\end{tabularx}

\\vspace{10pt}

% Note about system generated copy
\\begin{center}
    \\textbf{*** This is system generated copy, no signature required ***}
\\end{center}

\\vspace{15pt}

% Signature Section
\\noindent
\\begin{minipage}[t]{\\textwidth}
\\begin{minipage}[t]{0.45\\textwidth}
    \\centering
    \\rule{6cm}{0.5pt}\\\\
    {\\fontsize{9}{10}\\selectfont Prepared By: ${escapeLatex(bill.user?.name || '')}}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
    \\centering
    \\rule{6cm}{0.5pt}\\\\
    {\\fontsize{9}{10}\\selectfont Approved By}
\\end{minipage}
\\end{minipage}

\\vspace{20pt}

% Contact information at bottom
\\begin{center}
    \\footnotesize
    For any further query, please communicate with us. 24/7 Call Number \\companyphoneone\\ \\& \\companyphonetwo
\\end{center}

\\end{document}`;
    }
    async generateChallanPdf(challanId) {
        const challan = await this.prisma.challan.findUnique({
            where: { id: challanId },
            include: {
                items: {
                    include: {
                        inventory: {
                            select: {
                                id: true,
                                productCode: true,
                                productName: true,
                                description: true,
                            },
                        },
                    },
                },
                buyerPurchaseOrder: {
                    include: {
                        quotation: {
                            select: {
                                companyName: true,
                                companyAddress: true,
                                companyContact: true,
                                contactPersonName: true,
                            },
                        },
                        bills: {
                            select: {
                                id: true,
                                billNumber: true,
                                billDate: true,
                                vatRegNo: true,
                                code: true,
                                vendorNo: true,
                            },
                            orderBy: {
                                billDate: 'desc',
                            },
                            take: 1,
                        },
                    },
                },
            },
        });
        if (!challan) {
            throw new Error(`Challan with ID ${challanId} not found`);
        }
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        try {
            const latexContent = this.generateLatexChallanTemplate(challan);
            const texFilePath = path.join(tmpDir.path, 'challan.tex');
            await fs.writeFile(texFilePath, latexContent, 'utf8');
            await this.copyAssets(tmpDir.path);
            const pdfBuffer = await this.compileLatex(texFilePath, tmpDir.path);
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error('Challan PDF generation failed:', error);
            throw error;
        }
        finally {
            await tmpDir.cleanup();
        }
    }
    generateLatexChallanTemplate(challan) {
        const escapeLatex = (text) => {
            if (!text)
                return '';
            return text
                .replace(/\\/g, '\\textbackslash{}')
                .replace(/#/g, '\\#')
                .replace(/\$/g, '\\$')
                .replace(/%/g, '\\%')
                .replace(/&/g, '\\&')
                .replace(/_/g, '\\_')
                .replace(/{/g, '\\{')
                .replace(/}/g, '\\}')
                .replace(/~/g, '\\textasciitilde{}')
                .replace(/\^/g, '\\textasciicircum{}')
                .replace(/</g, '\\textless{}')
                .replace(/>/g, '\\textgreater{}')
                .replace(/\n/g, '\\\\');
        };
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        };
        const truncateProductCode = (code, maxLength = 20) => {
            if (!code || code.length <= maxLength)
                return code;
            const firstPart = code.substring(0, 8);
            const lastPart = code.substring(code.length - 3);
            return `${firstPart}…${lastPart}`;
        };
        let itemsTableRows = '';
        let rowCounter = 1;
        let totalQuantity = 0;
        challan.items.forEach((item) => {
            const itemDescription = escapeLatex(item.inventory.description || item.inventory.productName);
            const itemCode = escapeLatex(truncateProductCode(item.inventory.productCode || 'N/A'));
            totalQuantity += item.quantity;
            itemsTableRows += `
${rowCounter} & ${itemCode} & ${itemDescription} & ${item.quantity} & Pcs \\\\
\\hline`;
            rowCounter++;
        });
        const companyName = challan.buyerPurchaseOrder?.quotation?.companyName || 'Customer';
        const companyAddress = challan.buyerPurchaseOrder?.quotation?.companyAddress || 'Address not specified';
        const contactPerson = challan.buyerPurchaseOrder?.quotation?.contactPersonName || 'Contact Person';
        const companyContact = challan.buyerPurchaseOrder?.quotation?.companyContact || 'N/A';
        const latestBill = challan.buyerPurchaseOrder?.bills?.[0];
        const invoiceNo = latestBill ? latestBill.billNumber : 'N/A';
        const invoiceDate = latestBill ? formatDate(latestBill.billDate) : 'N/A';
        const vatRegNo = latestBill?.vatRegNo || 'N/A';
        const code = latestBill?.code || 'N/A';
        const vendorNo = latestBill?.vendorNo || 'N/A';
        const addressLines = companyAddress.split(',').map(line => line.trim());
        const addressLine1 = addressLines[0] || '';
        const addressLine2 = addressLines.slice(1).join(', ') || '';
        const status = challan.status;
        let statusColor = 'gray';
        let statusText = status;
        switch (status) {
            case 'DISPATCHED':
                statusColor = 'blue';
                break;
            case 'DELIVERED':
                statusColor = 'green';
                break;
            case 'RETURNED':
                statusColor = 'red';
                break;
            case 'REJECTED':
                statusColor = 'red';
                break;
            default:
                statusColor = 'gray';
        }
        return `\\documentclass[8pt]{article}
\\usepackage[a4paper, margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{array}
\\usepackage{longtable}
\\usepackage{multirow}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{tabularx}
\\usepackage{ragged2e}
\\usepackage{calc}
\\usepackage{datetime}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{fontspec}

% Set Comfortaa font
\\setmainfont{Comfortaa}[
    Path = ./,
    Extension = .ttf,
    UprightFont = *-Regular,
    BoldFont = *-Bold,
    Scale = 0.9
]

% Color settings
\\definecolor{companycolor}{RGB}{0, 51, 102}
\\definecolor{dispatchedcolor}{RGB}{33, 150, 243}    % Blue for DISPATCHED
\\definecolor{deliveredcolor}{RGB}{76, 175, 80}      % Green for DELIVERED
\\definecolor{returnedcolor}{RGB}{244, 67, 54}       % Red for RETURNED
\\definecolor{rejectedcolor}{RGB}{244, 67, 54}       % Red for REJECTED
\\definecolor{draftcolor}{RGB}{158, 158, 158}        % Gray for DRAFT

% Header and footer settings
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\fancyfoot[C]{\\footnotesize Page \\thepage\\ of \\pageref{LastPage}}

% Custom commands
\\newcommand{\\challantitle}{Challan}
\\newcommand{\\companyname}{Genuine Stationers \\& Gift Corner}
\\newcommand{\\companyaddress}{1/17/B Sikdar Real Estate, Road-6, Dhanmondi, Dhaka-1229}
\\newcommand{\\companyphoneone}{+8801711560963}
\\newcommand{\\companyphonetwo}{+8801971560963}
\\newcommand{\\companylandline}{+88 02 9114774}
\\newcommand{\\companyemailone}{gsgcreza@gmail.com}
\\newcommand{\\companyemailtwo}{gsmreza87@yahoo.com}

% Status command
\\newcommand{\\challanstatus}{${status}}

\\begin{document}

% =========================
% Company Header
% =========================
\\noindent
\\begin{minipage}[t]{\\textwidth}
\\vspace{0pt}

% -------------------------
% Left: Logo (fixed height)
% -------------------------
\\begin{minipage}[t]{0.35\\textwidth}
\\vspace{0pt}
\\includegraphics[width=0.8\\linewidth]{logo.jpg}
\\end{minipage}
\\hfill
% -------------------------
% Right: Name (top) + Details + QR
% -------------------------
\\begin{minipage}[t]{0.6\\textwidth}
\\vspace{0pt}

% Company Name (same level as logo)
{\\raggedleft
\\fontsize{16}{18}\\selectfont
\\textbf{\\textcolor{companycolor}{\\companyname}}
\\par}

\\vspace{4pt} % tight spacing under name

% -------- Text + QR row --------
\\noindent
\\begin{minipage}[t]{0.72\\linewidth}
\\vspace{0pt}
\\raggedleft
\\fontsize{7}{8}\\selectfont
\\linespread{1}\\selectfont

\\companyaddress\\\\[2pt]
Phone: \\companyphoneone, \\companyphonetwo\\\\[2pt]
\\companylandline\\\\[2pt]
\\companyemailone\\\\[2pt]
\\companyemailtwo
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.19\\linewidth}
\\vspace{0pt}
\\raggedleft
\\includegraphics[width=\\linewidth]{qr.jpg}
\\end{minipage}

\\end{minipage}

\\end{minipage}

\\vspace{20pt}

% Challan title on top right
\\begin{flushright}
    {\\fontsize{16}{19.2}\\selectfont \\textbf{\\textcolor{companycolor}{\\challantitle}}}
\\end{flushright}

% Status indicator under Challan title
\\begin{flushright}
    \\if\\challanstatus DISPATCHED
        \\colorbox{dispatchedcolor}{\\textbf{DISPATCHED}}
    \\else\\if\\challanstatus DELIVERED
        \\colorbox{deliveredcolor}{\\textbf{DELIVERED}}
    \\else\\if\\challanstatus RETURNED
        \\colorbox{returnedcolor}{\\textbf{RETURNED}}
    \\else\\if\\challanstatus REJECTED
        \\colorbox{rejectedcolor}{\\textbf{REJECTED}}
    \\else
        \\colorbox{draftcolor}{\\textbf{DRAFT}}
    \\fi\\fi\\fi\\fi
\\end{flushright}

\\vspace{5pt}

% Challan header information (two-column layout)
\\begin{tabularx}{\\textwidth}{@{}Xr@{}}
    \\textbf{Challan No.:} ${escapeLatex(challan.challanNumber)} & \\textbf{VAT Reg. No.:} ${escapeLatex(vatRegNo)} \\\\
    \\textbf{Customer Name:} \\textbf{${escapeLatex(companyName)}} & \\textbf{Code:} ${escapeLatex(code)} \\\\
    \\textbf{Address:} ${escapeLatex(addressLine1)} & \\textbf{Vendor ID:} ${escapeLatex(vendorNo)} \\\\
    \\hspace{2.5cm} ${escapeLatex(addressLine2)} & \\textbf{Purchase Order No.:} ${escapeLatex(challan.buyerPurchaseOrder?.poNumber || 'N/A')} \\\\
    \\textbf{Phone:} ${escapeLatex(companyContact)} & \\textbf{Purchase Order Date:} ${challan.buyerPurchaseOrder?.poDate ? formatDate(challan.buyerPurchaseOrder.poDate) : 'N/A'} \\\\
    \\textbf{Date:} ${challan.dispatchDate ? formatDate(challan.dispatchDate) : formatDate(challan.createdAt)} & \\textbf{Invoice No.:} ${escapeLatex(invoiceNo)} \\\\
    & \\textbf{Print Date:} \\today \\\\
\\end{tabularx}

\\vspace{15pt}

% Items Table
\\begin{longtable}{|p{0.5cm}|p{2.5cm}|p{6cm}|p{2cm}|p{1.5cm}|}
    \\hline
    \\textbf{Sl.} & \\textbf{Item Code} & \\textbf{Item Name \\& Description} & \\textbf{Quantity} & \\textbf{Unit} \\\\
    \\hline
    \\endfirsthead
    
    \\hline
    \\textbf{Sl.} & \\textbf{Item Code} & \\textbf{Item Name \\& Description} & \\textbf{Quantity} & \\textbf{Unit} \\\\
    \\hline
    \\endhead
    
    \\hline
    \\multicolumn{5}{c}{\\textit{Continued on next page...}} \\\\
    \\endfoot
    
    \\hline
    \\endlastfoot
    
    ${itemsTableRows}
    
    % Summary Row
    \\multicolumn{3}{|r|}{\\textbf{Total Quantity:}} & \\textbf{${totalQuantity}} & \\textbf{Pcs} \\\\
    \\hline
\\end{longtable}

\\vspace{15pt}

% Delivery Information
\\noindent
\\begin{minipage}[t]{0.48\\textwidth}
    \\textbf{Dispatch Date:} ${challan.dispatchDate ? formatDate(challan.dispatchDate) : 'To be dispatched'} \\\\
    \\textbf{Delivery Date:} ${challan.deliveryDate ? formatDate(challan.deliveryDate) : 'To be delivered'}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
    \\raggedleft
    \\textbf{Total Items:} ${challan.items.length} \\\\
    \\textbf{Total Quantity:} ${totalQuantity} Pcs
\\end{minipage}

\\vspace{20pt}

% Note about system generated copy
\\begin{center}
    \\textbf{*** This is system generated copy, no signature required ***}
\\end{center}

\\vspace{15pt}
\\vfill

% Signature Section
\\noindent
\\begin{minipage}[t]{\\textwidth}
\\begin{minipage}[t]{0.45\\textwidth}
    \\centering
    \\rule{6cm}{0.5pt}\\\\
    {\\fontsize{9}{10}\\selectfont Prepared By}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
    \\centering
    \\rule{6cm}{0.5pt}\\\\
    {\\fontsize{9}{10}\\selectfont Approved By}
\\end{minipage}
\\end{minipage}

\\vspace{20pt}

% Contact information at bottom
\\begin{center}
    \\footnotesize
    For any further query, please communicate with us. 24/7 Call Number \\companyphoneone\\ \\& \\companyphonetwo
\\end{center}

\\end{document}`;
    }
    numberToWords(num) {
        const units = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];
        if (num === 0)
            return 'Zero Taka Only';
        let integerPart = Math.floor(num);
        let decimalPart = Math.round((num - integerPart) * 100);
        let words = '';
        if (integerPart >= 10000000) {
            words += this.convertCrore(integerPart, units, tens);
            integerPart %= 10000000;
        }
        if (integerPart >= 100000) {
            words += this.convertLakh(integerPart, units, tens);
            integerPart %= 100000;
        }
        if (integerPart >= 1000) {
            words += this.convertThousand(integerPart, units, tens);
            integerPart %= 1000;
        }
        if (integerPart >= 100) {
            words += this.convertHundred(integerPart, units, tens);
            integerPart %= 100;
        }
        if (integerPart > 0) {
            if (words !== '')
                words += ' ';
            if (integerPart < 20) {
                words += units[integerPart];
            }
            else {
                words += tens[Math.floor(integerPart / 10)];
                if (integerPart % 10 > 0) {
                    words += ' ' + units[integerPart % 10];
                }
            }
        }
        words += words ? ' Taka' : 'Taka';
        if (decimalPart > 0) {
            let paisaWords = '';
            if (decimalPart < 20) {
                paisaWords = units[decimalPart];
            }
            else {
                paisaWords = tens[Math.floor(decimalPart / 10)];
                if (decimalPart % 10 > 0) {
                    paisaWords += ' ' + units[decimalPart % 10];
                }
            }
            words += ` and ${paisaWords} Paisa`;
        }
        return words + ' Only';
    }
    convertCrore(num, units, tens) {
        const crore = Math.floor(num / 10000000);
        let words = '';
        if (crore >= 100) {
            words += this.convertHundred(crore, units, tens);
        }
        else if (crore >= 20) {
            words += tens[Math.floor(crore / 10)];
            if (crore % 10 > 0) {
                words += ' ' + units[crore % 10];
            }
        }
        else if (crore > 0) {
            words += units[crore];
        }
        return words + ' Crore ';
    }
    convertLakh(num, units, tens) {
        const lakh = Math.floor(num / 100000);
        let words = '';
        if (lakh >= 100) {
            words += this.convertHundred(lakh, units, tens);
        }
        else if (lakh >= 20) {
            words += tens[Math.floor(lakh / 10)];
            if (lakh % 10 > 0) {
                words += ' ' + units[lakh % 10];
            }
        }
        else if (lakh > 0) {
            words += units[lakh];
        }
        return words + ' Lakh ';
    }
    convertThousand(num, units, tens) {
        const thousand = Math.floor(num / 1000);
        let words = '';
        if (thousand >= 100) {
            words += this.convertHundred(thousand, units, tens);
        }
        else if (thousand >= 20) {
            words += tens[Math.floor(thousand / 10)];
            if (thousand % 10 > 0) {
                words += ' ' + units[thousand % 10];
            }
        }
        else if (thousand > 0) {
            words += units[thousand];
        }
        return words + ' Thousand ';
    }
    convertHundred(num, units, tens) {
        const hundred = Math.floor(num / 100);
        return units[hundred] + ' Hundred ';
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map
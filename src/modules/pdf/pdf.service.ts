// src/pdf/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import { Quotation } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

// Interface for full quotation data with relations
export interface QuotationWithItems extends Quotation {
  items: Array<{
    id: string;
    quantity: number;
    mrp: number;
    unitPrice: number;
    packagePrice: number;
    taxPercentage: number;
    totalPrice: number;
    inventory: {
      id: string;
      productCode: string;
      productName: string;
      description?: string;
      imageUrl?: string;
    };
  }>;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Generate PDF for a quotation using XeLaTeX
   */
  async generateQuotationPdf(quotationId: string): Promise<Buffer> {
    // Fetch complete quotation data with items and inventory
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

    // Create temporary directory
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    
    try {
      // Create LaTeX content
      const latexContent = this.generateLatexTemplate(quotation);
      console.log(latexContent)
      const texFilePath = path.join(tmpDir.path, 'quotation.tex');
      
      // Write LaTeX file
      await fs.writeFile(texFilePath, latexContent, 'utf8');
      
      // Copy assets if they exist
      await this.copyAssets(tmpDir.path);
      
      // Compile LaTeX to PDF using XeLaTeX
      const pdfBuffer = await this.compileLatex(texFilePath, tmpDir.path);
      
      return pdfBuffer;
    } catch (error) {
      this.logger.error('PDF generation failed:', error);
      throw error;
    } finally {
      // Clean up temporary directory
      await tmpDir.cleanup();
    }
  }

  /**
   * Generate LaTeX template with quotation data
   */
private generateLatexTemplate(quotation: QuotationWithItems): string {
    // Helper function to escape LaTeX special characters
    const escapeLatex = (text: string): string => {
        if (!text) return '';
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

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Truncate product code
    const truncateProductCode = (code: string, maxLength: number = 20): string => {
        if (!code || code.length <= maxLength) return code;
        const firstPart = code.substring(0, 8);
        const lastPart = code.substring(code.length - 3);
        return `${firstPart}…${lastPart}`;
    };

    // Generate items table rows
    let itemsTableRows = '';
    let rowCounter = 1;
    let subTotal = 0;

    quotation.items.forEach((item) => {
        const amount = item.quantity * item.unitPrice;
        subTotal += amount;

        // Escape all text values
        const productCode = escapeLatex(truncateProductCode(item.inventory.productCode || 'N/A'));
        const productName = escapeLatex(item.inventory.productName);
        const description = escapeLatex(item.inventory.description || '');
        
        itemsTableRows += `
${rowCounter} & ${productCode} & ${productName} & ${description} & ${item.quantity} & Pcs & ${formatCurrency(item.unitPrice)} & ${formatCurrency(amount)} \\\\
\\hline`;
        rowCounter++;
    });

    // Calculate totals
    const taxAmount = quotation.taxAmount || 0;
    const totalAmount = quotation.totalAmount || subTotal + taxAmount;

    // Generate money in words
    const moneyInWords = this.numberToWords(totalAmount);

    // Format valid until date
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
    
    const bodyContent =
        quotation.body?.replace(/\n/g, '\\\\[5pt] ') ||
        `Greetings from ${escapeLatex(
            quotation.companyName,
        )}!\\\\[5pt] Hope you are doing well.\\\\[5pt] We would like to share our quotation for the above mentioned products and services for your kind consideration. The details are given below for easy reference and kind perusal:`;

    // Generate delivery terms
    const deliveryDays = quotation.deliveryDays || 7;
    const deliveryTerms = escapeLatex(
        quotation.deliveryTerms || `Delivery: Within ${deliveryDays} days`
    );

    // LaTeX template
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

\\noindent\\textbf{Subject:} ${escapeLatex(
        quotation.subject || 'Quotation for Products and Services',
    )}

\\vspace{10pt}

Dear ${escapeLatex(
        quotation.contactPersonName?.split(' ')[0] || 'Sir/Madam',
    )},

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
\\item ${escapeLatex(
        quotation.generalTerms || 'Price is Without VAT & TAX',
    )}
\\item ${escapeLatex(
        quotation.paymentTerms || 'Payment: 50% advance, 50% on delivery',
    )}
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
  /**
   * Copy necessary assets to temporary directory
   */
  private async copyAssets(tmpDirPath: string): Promise<void> {
    try {
      // List of possible asset locations
      const assetLocations = [
        path.join(process.cwd(), 'assets'),
        path.join(process.cwd(), 'public'),
        path.join(process.cwd(), 'static'),
        path.join(process.cwd(), 'fonts'),
        path.join(__dirname, '..', '..', 'assets'),
        path.join(__dirname, '..', '..', 'public'),
      ];

      // Assets to copy
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
        
        // Create placeholder if asset not found
        if (!assetCopied && (asset.includes('logo') || asset.includes('qr'))) {
          await this.createPlaceholderImage(path.join(tmpDirPath, asset));
        }
      }

      // Copy fonts
      const fontFiles = ['Comfortaa-Regular.ttf', 'Comfortaa-Bold.ttf'];
      for (const font of fontFiles) {
        let fontCopied = false;
        for (const location of assetLocations) {
          // Try directly in location
          let fontPath = path.join(location, font);
          if (await fs.pathExists(fontPath)) {
            await fs.copyFile(fontPath, path.join(tmpDirPath, font));
            this.logger.log(`Copied font: ${fontPath}`);
            fontCopied = true;
            break;
          }
          // Try in location/fonts
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
    } catch (error) {
      this.logger.warn('Could not copy assets:', error.message);
    }
  }

  /**
   * Create placeholder image
   */
  private async createPlaceholderImage(filePath: string): Promise<void> {
    // Create a simple SVG placeholder
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

  /**
   * Compile LaTeX to PDF using XeLaTeX
   */
  private async compileLatex(texFilePath: string, outputDir: string): Promise<Buffer> {
    const { execa } = await import("execa");
    
    try {
      // First pass
      await execa('xelatex', [
        '-interaction=nonstopmode',
        '-output-directory=' + outputDir,
        texFilePath,
      ], {
        cwd: outputDir,
        timeout: 30000,
      });

      // Second pass for references
      await execa('xelatex', [
        '-interaction=nonstopmode',
        '-output-directory=' + outputDir,
        texFilePath,
      ], {
        cwd: outputDir,
        timeout: 60000,
      });

      // Read PDF file
      const pdfPath = texFilePath.replace('.tex', '.pdf');
      if (!(await fs.pathExists(pdfPath))) {
        throw new Error(`PDF not generated at: ${pdfPath}`);
      }

      const pdfBuffer = await fs.readFile(pdfPath);
      this.logger.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);
      
      return pdfBuffer;
    } catch (error) {
      // Read log file for debugging
      const logPath = texFilePath.replace('.tex', '.log');
      if (await fs.pathExists(logPath)) {
        const logContent = await fs.readFile(logPath, 'utf8');
        this.logger.error('LaTeX log content:', logContent);
      }
      
      throw new Error(`LaTeX compilation failed: ${error.message}`);
    }
  }

  /**
   * Convert number to words (Bangladeshi Taka format)
   */
  private numberToWords(num: number): string {
    // Simple implementation - you can enhance this
    const units = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    
    if (num === 0) return 'Zero Taka Only';
    
    let integerPart = Math.floor(num);
    let decimalPart = Math.round((num - integerPart) * 100);
    
    let words = '';
    
    // Convert integer part
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
      if (words !== '') words += ' ';
      if (integerPart < 20) {
        words += units[integerPart];
      } else {
        words += tens[Math.floor(integerPart / 10)];
        if (integerPart % 10 > 0) {
          words += ' ' + units[integerPart % 10];
        }
      }
    }
    
    words += words ? ' Taka' : 'Taka';
    
    // Convert decimal part (paisa)
    if (decimalPart > 0) {
      let paisaWords = '';
      if (decimalPart < 20) {
        paisaWords = units[decimalPart];
      } else {
        paisaWords = tens[Math.floor(decimalPart / 10)];
        if (decimalPart % 10 > 0) {
          paisaWords += ' ' + units[decimalPart % 10];
        }
      }
      words += ` and ${paisaWords} Paisa`;
    }
    
    return words + ' Only';
  }

  private convertCrore(num: number, units: string[], tens: string[]): string {
    const crore = Math.floor(num / 10000000);
    let words = '';
    
    if (crore >= 100) {
      words += this.convertHundred(crore, units, tens);
    } else if (crore >= 20) {
      words += tens[Math.floor(crore / 10)];
      if (crore % 10 > 0) {
        words += ' ' + units[crore % 10];
      }
    } else if (crore > 0) {
      words += units[crore];
    }
    
    return words + ' Crore ';
  }

  private convertLakh(num: number, units: string[], tens: string[]): string {
    const lakh = Math.floor(num / 100000);
    let words = '';
    
    if (lakh >= 100) {
      words += this.convertHundred(lakh, units, tens);
    } else if (lakh >= 20) {
      words += tens[Math.floor(lakh / 10)];
      if (lakh % 10 > 0) {
        words += ' ' + units[lakh % 10];
      }
    } else if (lakh > 0) {
      words += units[lakh];
    }
    
    return words + ' Lakh ';
  }

  private convertThousand(num: number, units: string[], tens: string[]): string {
    const thousand = Math.floor(num / 1000);
    let words = '';
    
    if (thousand >= 100) {
      words += this.convertHundred(thousand, units, tens);
    } else if (thousand >= 20) {
      words += tens[Math.floor(thousand / 10)];
      if (thousand % 10 > 0) {
        words += ' ' + units[thousand % 10];
      }
    } else if (thousand > 0) {
      words += units[thousand];
    }
    
    return words + ' Thousand ';
  }

  private convertHundred(num: number, units: string[], tens: string[]): string {
    const hundred = Math.floor(num / 100);
    return units[hundred] + ' Hundred ';
  }
}
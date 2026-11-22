import { Invoice, InvoiceTotalsBreakdown } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Universal text sanitizer converting special unicode symbols to clean ASCII equivalents
 */
export function sanitizeText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/•/g, '|')
    .replace(/₹/g, 'Rs. ')
    .replace(/★/g, '*')
    .replace(/☆/g, '*')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...');
}

/**
 * Format currency without currency symbol (e.g. 1,23,456.00)
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency in Indian standard with ₹ symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('₹', '₹ ');
}

/**
 * Converts numeric amount to Indian currency words
 * e.g. 1250.50 -> "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only"
 */
export function numberToWords(num: number): string {
  if (isNaN(num) || num <= 0) return 'Rupees Zero Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert2(n: number): string {
    if (n < 10) return single[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${tens[t]}${o > 0 ? ' ' + single[o] : ''}`.trim();
  }

  function convert3(n: number): string {
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (hundreds > 0) res += `${single[hundreds]} Hundred`;
    if (rem > 0) res += (hundreds > 0 ? ' ' : '') + convert2(rem);
    return res;
  }

  const parts = num.toFixed(2).split('.');
  let rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1] || '0', 10);

  const crore = Math.floor(rupees / 10000000);
  rupees %= 10000000;
  const lakh = Math.floor(rupees / 100000);
  rupees %= 100000;
  const thousand = Math.floor(rupees / 1000);
  rupees %= 1000;
  const remainder = rupees;

  let words = '';
  if (crore > 0) words += `${convert3(crore)} Crore `;
  if (lakh > 0) words += `${convert3(lakh)} Lakh `;
  if (thousand > 0) words += `${convert3(thousand)} Thousand `;
  if (remainder > 0) words += `${convert3(remainder)} `;

  words = words.trim();
  let result = words.length > 0 ? `Rupees ${words}` : 'Rupees Zero';
  if (paise > 0) result += ` and ${convert2(paise)} Paise`;
  return `${result} Only`;
}

/**
 * Computes totals with percentage-based discount and no delivery charges
 */
export function calculateInvoiceTotals(invoice: Invoice): InvoiceTotalsBreakdown {
  const subtotal = invoice.items.reduce((acc, item) => {
    return acc + item.quantity * item.unitPrice;
  }, 0);

  const discountPct =
    invoice.discountPct !== undefined
      ? invoice.discountPct
      : invoice.discount && subtotal > 0
      ? (invoice.discount / subtotal) * 100
      : 0;

  const discount = (subtotal * discountPct) / 100;
  const taxableValue = Math.max(0, subtotal - discount);
  const grandTotal = taxableValue;

  return {
    subtotal,
    discountPct,
    discount,
    deliveryCharges: 0,
    taxableValue,
    cgst: 0,
    sgst: 0,
    totalGst: 0,
    grandTotal,
    effectiveTaxRatePct: 0,
    halfRateLabel: '0%',
    fullRateLabel: '0%',
  };
}

/**
 * Direct client-side PDF download with full Multi-Page and Single-Page support.
 * Uses html2canvas (bundled) + jsPDF (bundled). No CDN, no network required.
 */
export async function downloadInvoicePdf(
  elementId: string = 'printable-proforma',
  filename: string = 'Invoice.pdf',
  onProgress?: (inProgress: boolean) => void
): Promise<void> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('.invoice-page'));
  const targets = pageElements.length > 0
    ? pageElements
    : ([document.getElementById(elementId)].filter(Boolean) as HTMLElement[]);

  if (targets.length === 0) {
    window.print();
    return;
  }

  onProgress?.(true);

  // A4: 210 mm × 297 mm  →  794 × 1123 px at 96 dpi
  const A4_MM_W = 210;
  const A4_MM_H = 297;
  const A4_PX_W = 794;
  const A4_PX_H = 1123;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < targets.length; i++) {
      const sourceElement = targets[i];

      // Staging container at top-left
      const wrap = document.createElement('div');
      wrap.style.cssText =
        `position:fixed;top:0;left:0;` +
        `width:${A4_PX_W}px;height:${A4_PX_H}px;` +
        `overflow:hidden;background:#fff;` +
        `z-index:2147483647;pointer-events:none;opacity:0;`;

      // Deep-clone the invoice page element
      const clone = sourceElement.cloneNode(true) as HTMLElement;
      clone.id = `pdf-export-clone-${i}`;
      clone.style.cssText =
        `transform:none !important;-webkit-transform:none !important;` +
        `position:relative;top:0;left:0;margin:0;` +
        `width:${A4_PX_W}px !important;max-width:${A4_PX_W}px !important;` +
        `height:${A4_PX_H}px !important;max-height:${A4_PX_H}px !important;` +
        `min-height:${A4_PX_H}px !important;` +
        `box-sizing:border-box;box-shadow:none;border-radius:0;overflow:hidden;background:#ffffff;`;

      wrap.appendChild(clone);
      document.body.appendChild(wrap);

      // Two animation frames so the browser fully lays out the clone
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );

      // Capture at 2× for crisp text
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        width: A4_PX_W,
        height: A4_PX_H,
        windowWidth: A4_PX_W,
        windowHeight: A4_PX_H,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.97);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM_W, A4_MM_H);

      wrap.parentNode?.removeChild(wrap);
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    window.print();
  } finally {
    onProgress?.(false);
  }
}

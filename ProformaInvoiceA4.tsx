import React from 'react';
import { Invoice, InvoiceItem, StoreSettings } from './types';
import { calculateInvoiceTotals, formatNumber, numberToWords, sanitizeText } from './utils';

export type InvoiceTheme =
  | 'slate'
  | 'navy'
  | 'sage'
  | 'purple'
  | 'teal'
  | 'crimson'
  | string;

export interface PaletteColors {
  primary: string;
  primaryDark: string;
  accent: string;
  border: string;
  borderLight: string;
  tint: string;
  tintSubtle: string;
  badgeBg: string;
  badgeText: string;
}

export interface ProformaInvoiceA4Props {
  invoice: Invoice;
  store: StoreSettings;
  theme?: InvoiceTheme;
  upiUrl?: string;
  onPrint?: () => void;
  className?: string;
}

export const themePalettes: Record<string, PaletteColors> = {
  slate: {
    primary: '#1E293B',
    primaryDark: '#0F172A',
    accent: '#334155',
    border: '#CBD5E1',
    borderLight: '#E2E8F0',
    tint: '#F8FAFC',
    tintSubtle: '#F1F5F9',
    badgeBg: '#F1F5F9',
    badgeText: '#1E293B',
  },
  navy: {
    primary: '#0F2942',
    primaryDark: '#0A1C2E',
    accent: '#134074',
    border: '#B8CBE0',
    borderLight: '#DCE4EE',
    tint: '#F4F7FB',
    tintSubtle: '#EDF2F8',
    badgeBg: '#E8F0F8',
    badgeText: '#0F2942',
  },
  sage: {
    primary: '#2D5A4C',
    primaryDark: '#1E3E34',
    accent: '#3B7563',
    border: '#A8C5BC',
    borderLight: '#D8E6E3',
    tint: '#F4F7F5',
    tintSubtle: '#EAF2EF',
    badgeBg: '#E5EFEA',
    badgeText: '#2D5A4C',
  },
  purple: {
    primary: '#4A2574',
    primaryDark: '#351656',
    accent: '#5A2D82',
    border: '#D4C4E8',
    borderLight: '#E6DDF0',
    tint: '#FAF8FC',
    tintSubtle: '#F3EEF8',
    badgeBg: '#F3ECF9',
    badgeText: '#4A2574',
  },
  teal: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    accent: '#14B8A6',
    border: '#99F6E4',
    borderLight: '#CCFBF1',
    tint: '#F0FDFA',
    tintSubtle: '#E6FFFA',
    badgeBg: '#CCFBF1',
    badgeText: '#0F766E',
  },
  crimson: {
    primary: '#991B1B',
    primaryDark: '#7F1D1D',
    accent: '#B91C1C',
    border: '#FECACA',
    borderLight: '#FEE2E2',
    tint: '#FEF2F2',
    tintSubtle: '#FFF5F5',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
  },
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

export function blendWithWhite(r: number, g: number, b: number, factor: number): string {
  const newR = Math.max(0, Math.min(255, Math.round(255 - (255 - r) * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(255 - (255 - g) * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(255 - (255 - b) * factor)));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB
    .toString(16)
    .padStart(2, '0')}`;
}

export function darkenRgb(r: number, g: number, b: number, factor: number): string {
  const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB
    .toString(16)
    .padStart(2, '0')}`;
}

export function generateCustomPalette(colorHex: string): PaletteColors {
  const rgb = hexToRgb(colorHex);
  if (!rgb) return themePalettes.slate;
  const cleanHex = colorHex.startsWith('#') ? colorHex : `#${colorHex}`;
  return {
    primary: cleanHex,
    primaryDark: darkenRgb(rgb.r, rgb.g, rgb.b, 0.7),
    accent: darkenRgb(rgb.r, rgb.g, rgb.b, 0.85),
    border: blendWithWhite(rgb.r, rgb.g, rgb.b, 0.38),
    borderLight: blendWithWhite(rgb.r, rgb.g, rgb.b, 0.18),
    tint: blendWithWhite(rgb.r, rgb.g, rgb.b, 0.04),
    tintSubtle: blendWithWhite(rgb.r, rgb.g, rgb.b, 0.02),
    badgeBg: blendWithWhite(rgb.r, rgb.g, rgb.b, 0.12),
    badgeText: darkenRgb(rgb.r, rgb.g, rgb.b, 0.85),
  };
}

export function getPalette(themeKeyOrHex: string = 'slate'): PaletteColors {
  if (themePalettes[themeKeyOrHex]) return themePalettes[themeKeyOrHex];
  if (themeKeyOrHex.startsWith('#') || themeKeyOrHex.length === 6 || themeKeyOrHex.length === 3) {
    return generateCustomPalette(themeKeyOrHex);
  }
  return themePalettes.slate;
}

export function getThemeHex(theme: string = 'slate'): string {
  if (themePalettes[theme]) return themePalettes[theme].primary;
  if (theme.startsWith('#') && (theme.length === 7 || theme.length === 4)) return theme;
  if (theme.length === 6) return `#${theme}`;
  return '#1E293B';
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDisplayDate(value?: string | null): string {
  if (!value) return '—';
  const raw = String(value).trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) {
    const [, year, month, day] = iso;
    const monthName = MONTHS_SHORT[Number(month) - 1];
    if (monthName) return `${String(Number(day)).padStart(2, '0')} ${monthName} ${year}`;
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return `${String(date.getDate()).padStart(2, '0')} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
  }

  return raw;
}

const FONT_STACK = '"Poppins", "Inter", "Helvetica Neue", Arial, sans-serif';

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <p
    className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500"
    style={color ? { color } : undefined}
  >
    {children}
  </p>
);

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-[9px]">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="break-words text-right font-medium tabular-nums text-slate-900">{value}</dd>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium tabular-nums text-slate-900">{value}</span>
  </div>
);

const DEFAULT_TERMS = [
  '1. Goods once sold will not be taken back or exchanged.',
  '2. Prices quoted in this proforma are valid for 15 days from the issue date.',
  '3. Interest at 18% p.a. will be charged on overdue payments.',
  '4. Subject to local jurisdiction only.',
].join('\n');

interface PageSlice {
  pageIndex: number;
  items: InvoiceItem[];
  startItemNumber: number;
  isFirst: boolean;
  isLast: boolean;
}

function paginateItems(items: InvoiceItem[]): PageSlice[] {
  // If 8 or fewer items, it fits comfortably on a single page with full header, summary & footer
  if (items.length <= 8) {
    return [
      {
        pageIndex: 0,
        items,
        startItemNumber: 1,
        isFirst: true,
        isLast: true,
      },
    ];
  }

  // Multi-page capacities:
  // - Page 1 has full header & customer block, but NO summary or footer: fits up to 13 items
  // - Final page has compact header, summary, and full footer: fits up to 7 items
  // - Intermediate pages have compact header and no footer: fits up to 18 items
  const PAGE_1_CAP = 13;
  const FINAL_PAGE_CAP = 7;
  const INTERMEDIATE_CAP = 18;

  // For 9 to 20 items (2 pages total):
  // Fill Page 1 with up to 13 items first, then put the rest on Page 2
  if (items.length <= PAGE_1_CAP + FINAL_PAGE_CAP) {
    const page1Count = Math.min(PAGE_1_CAP, items.length - 1);

    return [
      {
        pageIndex: 0,
        items: items.slice(0, page1Count),
        startItemNumber: 1,
        isFirst: true,
        isLast: false,
      },
      {
        pageIndex: 1,
        items: items.slice(page1Count),
        startItemNumber: page1Count + 1,
        isFirst: false,
        isLast: true,
      },
    ];
  }

  // For 21+ items (3+ pages total):
  const slices: PageSlice[] = [];
  let remaining = [...items];
  let currentStart = 1;

  const page1Items = remaining.slice(0, PAGE_1_CAP);
  slices.push({
    pageIndex: 0,
    items: page1Items,
    startItemNumber: currentStart,
    isFirst: true,
    isLast: false,
  });
  currentStart += page1Items.length;
  remaining = remaining.slice(PAGE_1_CAP);

  while (remaining.length > 0) {
    if (remaining.length <= FINAL_PAGE_CAP) {
      slices.push({
        pageIndex: slices.length,
        items: remaining,
        startItemNumber: currentStart,
        isFirst: false,
        isLast: true,
      });
      break;
    }

    let takeCount: number;
    if (remaining.length <= INTERMEDIATE_CAP + FINAL_PAGE_CAP) {
      takeCount = Math.min(INTERMEDIATE_CAP, Math.ceil(remaining.length / 2));
    } else {
      takeCount = INTERMEDIATE_CAP;
    }

    const chunk = remaining.slice(0, takeCount);
    slices.push({
      pageIndex: slices.length,
      items: chunk,
      startItemNumber: currentStart,
      isFirst: false,
      isLast: false,
    });
    currentStart += chunk.length;
    remaining = remaining.slice(takeCount);
  }

  if (slices.length > 0) {
    slices[slices.length - 1].isLast = true;
  }

  return slices;
}

export const ProformaInvoiceA4: React.FC<ProformaInvoiceA4Props> = ({
  invoice,
  store,
  theme = 'slate',
  upiUrl,
  onPrint,
  className = '',
}) => {
  const palette = getPalette(theme);
  const isProforma = invoice.invoiceType !== 'TAX_INVOICE';
  const docTitle = isProforma ? 'Proforma Invoice' : 'Tax Invoice';
  const docLabel = isProforma ? 'Proforma' : 'Invoice';

  const items = invoice.items ?? [];
  const pageSlices = paginateItems(items);
  const totalPages = pageSlices.length;

  const totals = calculateInvoiceTotals(invoice);
  const grandTotal = Number(totals.grandTotal) || 0;
  const subtotal = Number(totals.subtotal) || 0;
  const discount = Number(totals.discount) || 0;
  const discountPct = Number(totals.discountPct) || 0;

  const storeName = store.storeName?.trim() || 'Company Name';
  const cleanUpi = store.upiId?.trim() || '';

  const storeLocation = [store.address, store.cityStatePin].filter(Boolean).join(', ');
  const contactLine = [store.phone && `Tel ${store.phone}`, store.email]
    .filter(Boolean)
    .join('   ·   ');
  const taxLine = [store.gstin && `GSTIN ${store.gstin}`, store.pan && `PAN ${store.pan}`]
    .filter(Boolean)
    .join('   ·   ');

  const customerName = invoice.customer.companyName || invoice.customer.name;
  const showAttn = Boolean(invoice.customer.companyName && invoice.customer.name);
  const customerLocation = [invoice.customer.streetAddress, invoice.customer.cityStatePin]
    .filter(Boolean)
    .join(', ');

  const paymentUri =
    upiUrl ||
    (cleanUpi
      ? `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(
          storeName
        )}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
          `${docLabel} ${invoice.invoiceNumber}`
        )}`
      : '');

  const qrImageUrl = paymentUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(
        paymentUri
      )}`
    : '';

  const hasPaymentDetails = Boolean(
    store.bankName || store.accountNumber || store.ifscCode || cleanUpi
  );

  const metaItems = [
    { label: 'Issue date', value: formatDisplayDate(invoice.createdAt) },
    { label: 'Due date', value: formatDisplayDate(invoice.dueDate || invoice.createdAt) },
    { label: 'Reference / PO', value: invoice.customerRefNo || '—' },
    { label: 'Place of supply', value: invoice.placeOfSupply || '—' },
  ];

  const terms = invoice.termsAndConditions?.trim() || DEFAULT_TERMS;
  const footerText = store.billFooter?.trim() || 'This is a computer-generated document.';

  return (
    <div className={`invoice-wrapper ${className} flex flex-col gap-8 print:gap-0`}>
      {onPrint && (
        <div className="no-print mx-auto mb-4 flex w-full max-w-[210mm] justify-end">
          <button
            type="button"
            onClick={onPrint}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: palette.primary }}
          >
            Print / Save as PDF
          </button>
        </div>
      )}

      {pageSlices.map((slice) => (
        <article
          key={slice.pageIndex}
          id={slice.isFirst ? 'printable-proforma' : `printable-proforma-page-${slice.pageIndex + 1}`}
          className="invoice-page invoice-container mx-auto flex flex-col bg-white text-slate-900 shadow-xl print:shadow-none"
          style={{
            width: '210mm',
            height: '297mm',
            maxHeight: '297mm',
            padding: '8mm 12mm 6mm',
            boxSizing: 'border-box',
            fontFamily: FONT_STACK,
          }}
        >
          {/* ============================================================== */}
          {/* 1. HEADER (Full on Page 1, Compact Continuation on later pages) */}
          {/* ============================================================== */}
          {slice.isFirst ? (
            <header className="flex items-start justify-between gap-10 pb-3.5">
              <div className="min-w-0 flex-1">
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={storeName}
                    className="mb-2.5 block h-auto w-auto max-h-[20mm] max-w-[70mm] object-contain object-left"
                  />
                )}
                <h1 className="text-[15px] font-semibold uppercase tracking-tight text-slate-950">
                  {storeName}
                </h1>
                {storeLocation && (
                  <p className="mt-0.5 text-[9px] leading-relaxed text-slate-600">{storeLocation}</p>
                )}
                {contactLine && <p className="mt-0.5 text-[9px] text-slate-600">{contactLine}</p>}
                {taxLine && <p className="mt-0.5 text-[8.5px] tabular-nums text-slate-500">{taxLine}</p>}
              </div>

              <div className="shrink-0 text-right">
                <h2 className="text-[26px] font-light leading-none tracking-tight text-slate-950">
                  {docTitle}
                </h2>
                <p className="mt-1.5 font-mono text-[9.5px] tabular-nums text-slate-600">
                  No. {invoice.invoiceNumber}
                </p>
              </div>
            </header>
          ) : (
            <header
              className="flex items-center justify-between border-b pb-2 mb-2.5"
              style={{ borderColor: palette.primary }}
            >
              <div className="flex items-center gap-2.5">
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={storeName}
                    className="h-5 w-auto max-w-[40mm] object-contain"
                  />
                )}
                <span className="text-[12px] font-semibold uppercase tracking-tight text-slate-950">
                  {storeName}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[9px] font-mono text-slate-600">
                  {docTitle} No. {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[8.5px] text-slate-600">
                <span>Date: {formatDisplayDate(invoice.createdAt)}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-800">
                  Page {slice.pageIndex + 1} of {totalPages}
                </span>
              </div>
            </header>
          )}

          {/* ============================================================== */}
          {/* 2. META STRIP (Page 1 only)                                    */}
          {/* ============================================================== */}
          {slice.isFirst && (
            <section
              className="grid grid-cols-4 gap-x-8 border-y py-2.5"
              style={{ borderColor: palette.borderLight }}
            >
              {metaItems.map((meta) => (
                <div key={meta.label} className="min-w-0">
                  <Eyebrow>{meta.label}</Eyebrow>
                  <p className="mt-1 break-words text-[10px] font-semibold tabular-nums text-slate-900">
                    {meta.value}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* ============================================================== */}
          {/* 3. PARTIES (Page 1 only)                                       */}
          {/* ============================================================== */}
          {slice.isFirst && (
            <section className="grid gap-8 py-3" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
              <div>
                <Eyebrow color={palette.primary}>Billed to</Eyebrow>
                <h3 className="mt-1 text-[12px] font-semibold uppercase tracking-tight text-slate-950">
                  {customerName}
                </h3>
                {showAttn && (
                  <p className="mt-0.5 text-[9px] text-slate-600">Attn: {invoice.customer.name}</p>
                )}
                {customerLocation && (
                  <p className="mt-1 max-w-[95mm] text-[9px] leading-relaxed text-slate-600">
                    {customerLocation}
                  </p>
                )}
              </div>

              <div>
                <Eyebrow>Customer details</Eyebrow>
                <dl className="mt-1 divide-y divide-slate-200">
                  <DetailRow label="GSTIN" value={invoice.customer.gstin} />
                  <DetailRow label="Phone" value={invoice.customer.phone} />
                  <DetailRow label="Email" value={invoice.customer.email} />
                  <DetailRow label="Payment terms" value={invoice.paymentTerms} />
                </dl>
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* 4. ITEMS TABLE                                                 */}
          {/* ============================================================== */}
          <section>
            <table className="w-full table-fixed border-collapse text-[9.5px]">
              <colgroup>
                <col style={{ width: '10mm' }} />
                <col />
                <col style={{ width: '22mm' }} />
                <col style={{ width: '26mm' }} />
                <col style={{ width: '26mm' }} />
                <col style={{ width: '30mm' }} />
              </colgroup>

              <thead>
                <tr
                  className="border-b text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                  style={{ borderColor: palette.primary }}
                >
                  <th className="py-2 pr-2 text-left font-semibold">No.</th>
                  <th className="px-2 py-2 text-left font-semibold">Description</th>
                  <th className="px-2 py-2 text-center font-semibold">HSN / SAC</th>
                  <th className="px-2 py-2 text-right font-semibold">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold">Rate (₹)</th>
                  <th className="py-2 pl-2 text-right font-semibold">Amount (₹)</th>
                </tr>
              </thead>

              <tbody>
                {slice.items.length === 0 ? (
                  <tr className="border-b border-slate-200">
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No line items added.
                    </td>
                  </tr>
                ) : (
                  slice.items.map((item, index) => {
                    const itemNumber = slice.startItemNumber + index;
                    const quantity = Number(item.quantity) || 0;
                    const unitPrice = Number(item.unitPrice) || 0;
                    const lineTotal = quantity * unitPrice;
                    const meta = [
                      item.size && `Size ${item.size}`,
                      item.color && `Colour ${item.color}`,
                    ]
                      .filter(Boolean)
                      .join('   ·   ');

                    return (
                      <tr key={item.id || itemNumber} className="border-b border-slate-200 align-top">
                        <td className="py-2 pr-2 text-[8.5px] tabular-nums text-slate-400">
                          {String(itemNumber).padStart(2, '0')}
                        </td>
                        <td className="px-2 py-2">
                          <p className="font-semibold leading-snug text-slate-900">
                            {sanitizeText(item.productName)}
                          </p>
                          {meta && <p className="mt-0.5 text-[8.5px] text-slate-500">{meta}</p>}
                        </td>
                        <td className="px-2 py-2 text-center text-[8.5px] tabular-nums text-slate-600">
                          {item.hsnCode || '—'}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-slate-800">
                          {quantity.toFixed(2)}
                          <span className="ml-1 text-[8px] text-slate-500">{item.unit || 'Pcs'}</span>
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-slate-700">
                          {formatNumber(unitPrice)}
                        </td>
                        <td className="py-2 pl-2 text-right font-semibold tabular-nums text-slate-900">
                          {formatNumber(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>

          {/* ============================================================== */}
          {/* CONTINUATION BAR (Non-final pages)                             */}
          {/* ============================================================== */}
          {!slice.isLast && (
            <>
              <div className="mt-auto" />
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[8px] text-slate-500">
                <span className="italic">Continued on Page {slice.pageIndex + 2}...</span>
                <span className="font-semibold tabular-nums">
                  Page {slice.pageIndex + 1} of {totalPages}
                </span>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* 5. SUMMARY + 6. FOOTER (Final Page Only)                       */}
          {/* ============================================================== */}
          {slice.isLast && (
            <>
              {/* 5. SUMMARY */}
              <section className="mt-3.5 grid gap-8" style={{ gridTemplateColumns: '1fr 74mm' }}>
                <div>
                  <Eyebrow>Amount in words</Eyebrow>
                  <p className="mt-1 text-[9.5px] font-medium leading-relaxed text-slate-800">
                    {numberToWords(grandTotal)}
                  </p>
                </div>

                <div className="text-[9.5px]">
                  <SummaryRow label="Subtotal" value={`₹ ${formatNumber(subtotal)}`} />
                  {discount > 0 && (
                    <SummaryRow
                      label={`Discount (${discountPct.toFixed(1)}%)`}
                      value={`− ₹ ${formatNumber(discount)}`}
                    />
                  )}

                  <div
                    className="mt-2 flex items-baseline justify-between border-t-2 pt-2"
                    style={{ borderColor: palette.primary }}
                  >
                    <span
                      className="text-[8.5px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: palette.primary }}
                    >
                      {isProforma ? 'Estimated total' : 'Total payable'}
                    </span>
                    <span
                      className="text-[17px] font-semibold tabular-nums tracking-tight"
                      style={{ color: palette.primary }}
                    >
                      ₹ {formatNumber(grandTotal)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 6. FOOTER */}
              <footer className="mt-3.5 pt-2">
                <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 74mm' }}>
                  <div>
                    {hasPaymentDetails && (
                      <>
                        <Eyebrow color={palette.primary}>Payment details</Eyebrow>
                        <div className="mt-1 flex items-start justify-between gap-4">
                          <dl className="flex-1 divide-y divide-slate-200">
                            <DetailRow label="Bank" value={store.bankName} />
                            <DetailRow label="Account no." value={store.accountNumber} />
                            <DetailRow label="IFSC" value={store.ifscCode} />
                            <DetailRow label="UPI ID" value={cleanUpi} />
                          </dl>

                          {qrImageUrl && (
                            <div className="shrink-0 text-center">
                              <img
                                src={qrImageUrl}
                                alt="Scan to pay via UPI"
                                className="h-[20mm] w-[20mm]"
                              />
                              <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Scan to pay
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-end text-right">
                    <p className="text-[9.5px] font-semibold text-slate-900">For {storeName}</p>
                    <div className="mt-8 w-full border-t border-slate-400" />
                    <p className="mt-1 text-[8.5px] text-slate-600">Authorised signatory</p>
                  </div>
                </div>

                <div className="mt-2.5 border-t pt-1.5" style={{ borderColor: palette.borderLight }}>
                  <Eyebrow color={palette.primary}>Terms & conditions</Eyebrow>
                  <p className="mt-0.5 whitespace-pre-line text-[7.5px] leading-relaxed text-slate-600">
                    {terms}
                  </p>
                </div>
              </footer>

              {/* Push bottom courtesy line cleanly to the bottom */}
              <div className="mt-auto" />
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-1.5 text-[7.5px] text-slate-500">
                <span>{footerText}</span>
                <span className="tabular-nums">
                  {totalPages > 1 ? `Page ${totalPages} of ${totalPages} · ` : ''}E. &amp; O.E.
                </span>
              </div>
            </>
          )}
        </article>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            font-family: 'Poppins', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          main > div {
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            display: block !important;
          }
          .invoice-page {
            font-family: 'Poppins', sans-serif !important;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 8mm 12mm 6mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .invoice-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .invoice-page * {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ProformaInvoiceA4;

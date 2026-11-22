import React from 'react';
import { Invoice, StoreSettings } from './types';
import { calculateInvoiceTotals, formatCurrency, numberToWords, sanitizeText } from './utils';

export interface ClassicGstInvoiceProps {
  invoice: Invoice;
  store: StoreSettings;
  upiUrl?: string;
  onPrint?: () => void;
  className?: string;
}

/**
 * A4 TEMPLATE: CLASSIC GST TAX & PROFORMA INVOICE (Rule 46 Compliant - Redesigned)
 * Supports both PROFORMA INVOICE and TAX INVOICE modes, custom logo uploads,
 * bank details, validity period, and crisp vector print styling.
 */
export const ClassicGstInvoice: React.FC<ClassicGstInvoiceProps> = ({
  invoice,
  store,
  upiUrl,
  onPrint,
  className = '',
}) => {
  const isProforma = invoice.invoiceType === 'PROFORMA_INVOICE';

  // Professional Royal Purple Palette matching Rule 46 specification
  const colors = {
    purpleTheme: '#4A2574', // Deep Royal Purple
    borderPurple: '#5B3B8C', // Crisp Box Grid Border
    zebraTint: '#FAF8FC', // Subtle Lavender Column Tint
    darkText: '#111827',
    mutedText: '#4B5563',
    accentBadge: isProforma ? '#E06A3B' : '#4A2574', // Warm amber-terracotta badge for Proforma
  };

  const cleanUpi = store.upiId?.trim() ? store.upiId.trim() : 'vogueapparels@icici';
  const gstinText = store.gstin?.trim() ? store.gstin.trim() : 'UNREGISTERED';
  const formattedDate =
    invoice.createdAt.length >= 10
      ? invoice.createdAt.substring(0, 10)
      : invoice.createdAt;
  const formattedValidUntil = invoice.validUntil
    ? invoice.validUntil.length >= 10
      ? invoice.validUntil.substring(0, 10)
      : invoice.validUntil
    : null;

  const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const totals = calculateInvoiceTotals(invoice);
  const hasGst = totals.totalGst > 0.004;
  const taxableTotal = totals.taxableValue;
  const totalGst = totals.totalGst;
  const grandTotal = totals.grandTotal;
  const effectiveTaxPct = hasGst ? totals.effectiveTaxRatePct : 0.0;

  // Generate UPI QR link if not provided
  const dynamicUpiUrl =
    upiUrl ||
    `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(
      store.storeName
    )}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      `${isProforma ? 'Proforma' : 'Invoice'} ${invoice.invoiceNumber}`
    )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    dynamicUpiUrl
  )}`;

  // Empty filler rows if items count is less than 4 for visual balance
  const fillerCount = Math.max(0, 4 - invoice.items.length);
  const fillerRows = Array.from({ length: fillerCount });

  return (
    <div className={`invoice-wrapper ${className}`}>
      {/* A4 Sheet Container */}
      <div
        id="printable-invoice"
        className="invoice-container bg-white text-[#111827] mx-auto select-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '11mm 13mm',
          boxSizing: 'border-box',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: colors.darkText,
        }}
      >
        {/* =================================================================== */}
        {/* 1. TOP BRAND HEADER & LOGO INTEGRATION                              */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between pb-2">
          {/* Logo Container with Professional Aspect Ratio Handling */}
          <div className="w-[120px] flex flex-col items-center justify-center shrink-0">
            {store.logoUrl ? (
              <div className="flex items-center justify-center shrink-0 max-h-14 max-w-[120px]">
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  className="max-h-14 max-w-[120px] w-auto h-auto object-contain"
                />
              </div>
            ) : (
              <div
                className="h-12 w-12 flex items-center justify-center rounded-full text-white font-bold text-2xl shadow-sm tracking-wider"
                style={{ backgroundColor: colors.purpleTheme }}
              >
                {store.storeName?.trim() ? store.storeName.trim()[0].toUpperCase() : 'V'}
              </div>
            )}
            <span
              className="text-[8.5px] font-bold text-center mt-1 truncate max-w-[120px] tracking-wide"
              style={{ color: colors.purpleTheme }}
            >
              {store.storeName}
            </span>
          </div>

          {/* Store Details */}
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-2">
              <h1
                className="text-[19px] font-extrabold leading-tight tracking-tight uppercase"
                style={{ color: colors.purpleTheme }}
              >
                {store.storeName}
              </h1>
              {isProforma && (
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Proforma
                </span>
              )}
            </div>

            {store.address && (
              <p
                className="text-[9.5px] leading-snug mt-0.5"
                style={{ color: colors.mutedText }}
              >
                {store.address}
              </p>
            )}

            <div className="flex items-center gap-3 mt-0.5 text-[9.5px]">
              {store.phone && (
                <span className="font-bold text-gray-900">
                  Ph: {store.phone}
                </span>
              )}
              {store.email && (
                <span style={{ color: colors.mutedText }}>
                  Email: {store.email}
                </span>
              )}
              {store.pan && (
                <span className="font-semibold text-gray-800">
                  PAN: {store.pan}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Purple Accent Divider Line */}
        <div
          className="h-[2px] w-full my-1"
          style={{ backgroundColor: colors.purpleTheme }}
        />

        {/* Store Tagline / Bill Footer */}
        <div className="text-center py-0.5">
          <p
            className="text-[8.5px] font-medium tracking-wide"
            style={{ color: colors.mutedText }}
          >
            {sanitizeText(
              store.billFooter && store.billFooter.length > 5
                ? store.billFooter
                : 'Premium Quality Garments & Fabrics | Wholesale & Export | Certified ISO 9001:2015'
            )}
          </p>
        </div>

        {/* =================================================================== */}
        {/* 2. PROFORMA / TAX INVOICE COMPLIANCE BAR                             */}
        {/* =================================================================== */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{
            border: `1.2px solid ${colors.borderPurple}`,
            borderBottom: `0.8px solid ${colors.borderPurple}`,
            backgroundColor: isProforma ? '#FFFDF8' : '#FFFFFF',
          }}
        >
          <div className="flex-1 text-[10.5px] font-bold">
            GSTIN : <span className="tracking-wide">{gstinText}</span>
          </div>

          {/* Central Document Title */}
          <div className="text-center">
            <div
              className="text-[14px] font-extrabold tracking-wider leading-none"
              style={{ color: isProforma ? '#8B2C10' : colors.purpleTheme }}
            >
              {isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE'}
            </div>
            {isProforma && (
              <div className="text-[7.5px] font-bold text-amber-800 tracking-wider mt-0.5">
                (NOT A TAX INVOICE - ESTIMATE / ADVANCE DEMAND)
              </div>
            )}
          </div>

          <div className="flex-1 text-right text-[9px] font-bold tracking-wider">
            {isProforma ? (
              formattedValidUntil ? (
                <span className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  VALID UNTIL: {formattedValidUntil}
                </span>
              ) : (
                'QUOTATION / ESTIMATE'
              )
            ) : (
              'ORIGINAL FOR RECIPIENT'
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. CUSTOMER (BILL TO) & INVOICE METADATA                            */}
        {/* =================================================================== */}
        <div
          className="flex text-[9.5px]"
          style={{
            borderLeft: `1.2px solid ${colors.borderPurple}`,
            borderRight: `1.2px solid ${colors.borderPurple}`,
            borderBottom: `0.8px solid ${colors.borderPurple}`,
          }}
        >
          {/* Left: Customer Detail (43%) */}
          <div
            className="w-[43%] flex flex-col"
            style={{ borderRight: `1px solid ${colors.borderPurple}` }}
          >
            <div
              className="text-center py-1 text-[9px] font-bold tracking-wide uppercase"
              style={{
                borderBottom: `0.8px solid ${colors.borderPurple}`,
                backgroundColor: colors.zebraTint,
              }}
            >
              Customer (Bill To) Details
            </div>
            <div className="p-2 space-y-1">
              <MetaField
                label="Name"
                value={invoice.customerName?.trim() || 'Walk-in Customer'}
                isBoldValue
              />
              <MetaField
                label="Address"
                value={invoice.customerAddress || 'Gujarat'}
              />
              <MetaField
                label="PHONE"
                value={invoice.customerPhone || '-'}
              />
              {invoice.customerEmail && (
                <MetaField
                  label="Email"
                  value={invoice.customerEmail}
                />
              )}
              <MetaField
                label="GSTIN"
                value={invoice.customerGstin || '-'}
              />
              <MetaField
                label="Place of Supply"
                value={invoice.placeOfSupply || 'Gujarat ( 24 )'}
              />
            </div>
          </div>

          {/* Right: Invoice Metadata (57%) */}
          <div className="w-[57%] p-2 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-2">
              <MetaField
                label={isProforma ? 'Proforma No.' : 'Invoice No.'}
                value={invoice.invoiceNumber}
                isBoldValue
              />
              <MetaField
                label={isProforma ? 'Proforma Date' : 'Invoice Date'}
                value={formattedDate}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {isProforma && formattedValidUntil ? (
                <MetaField
                  label="Valid Until"
                  value={formattedValidUntil}
                  isBoldValue
                />
              ) : (
                <MetaField
                  label="Payment Mode"
                  value={invoice.paymentMode || 'Bank Transfer'}
                />
              )}
              <MetaField
                label="Ref / Qtn No."
                value={invoice.referenceNumber || 'N/A'}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <MetaField
                label="Payment Terms"
                value={invoice.paymentTerms || (isProforma ? 'Advance Payment' : 'Immediate')}
              />
              <MetaField
                label="Reverse Charge"
                value="No"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. ITEMS TABLE WITH SPLIT GST COLUMNS                               */}
        {/* =================================================================== */}
        <div
          className="w-full"
          style={{
            borderLeft: `1.2px solid ${colors.borderPurple}`,
            borderRight: `1.2px solid ${colors.borderPurple}`,
          }}
        >
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr
                className="bg-white font-bold"
                style={{
                  borderBottom: `0.8px solid ${colors.borderPurple}`,
                }}
              >
                <th
                  style={{ width: '30px', borderColor: colors.borderPurple }}
                  className="py-1 px-1 border-r text-center align-middle"
                >
                  Sr.
                  <br />
                  No.
                </th>
                <th
                  style={{ borderColor: colors.borderPurple }}
                  className="py-1 px-2 border-r text-left align-middle"
                >
                  Name of Product / Service
                </th>
                <th
                  style={{ width: '60px', borderColor: colors.borderPurple }}
                  className="py-1 px-1 border-r text-center align-middle"
                >
                  HSN / SAC
                </th>
                <th
                  style={{ width: '48px', borderColor: colors.borderPurple }}
                  className="py-1 px-1 border-r text-center align-middle"
                >
                  Qty
                </th>
                <th
                  style={{ width: '64px', borderColor: colors.borderPurple }}
                  className="py-1 px-1 border-r text-right align-middle"
                >
                  Rate
                </th>
                <th
                  style={{ width: '74px', borderColor: colors.borderPurple }}
                  className="py-1 px-1 border-r text-right align-middle"
                >
                  Taxable Value
                </th>
                {/* GST Nested Header */}
                <th
                  style={{ width: '92px', borderColor: colors.borderPurple }}
                  className="p-0 border-r align-top"
                >
                  <div
                    className="py-0.5 text-center font-bold"
                    style={{
                      borderBottom: `0.6px solid ${colors.borderPurple}`,
                    }}
                  >
                    GST
                  </div>
                  <div className="flex">
                    <div
                      className="w-[30px] text-center py-0.5 border-r font-bold"
                      style={{ borderColor: colors.borderPurple }}
                    >
                      %
                    </div>
                    <div className="flex-1 text-center py-0.5 font-bold">
                      Amount
                    </div>
                  </div>
                </th>
                <th
                  style={{ width: '72px' }}
                  className="py-1 px-1 text-right align-middle font-bold"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Product Rows */}
              {invoice.items.map((item, idx) => {
                const taxableVal = item.unitPrice * item.quantity;
                const itemTaxAmt = taxableVal * (effectiveTaxPct / 100);
                const lineTotal = taxableVal + itemTaxAmt;

                return (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: `0.6px solid ${colors.borderPurple}`,
                    }}
                  >
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-1 border-r text-center align-top font-medium"
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-2 border-r text-left align-top"
                    >
                      <div className="font-bold text-[#111827]">
                        {sanitizeText(item.productName)}
                      </div>
                      {(item.size || item.color) && (
                        <div
                          className="text-[8.5px] italic font-normal"
                          style={{ color: colors.mutedText }}
                        >
                          {sanitizeText(
                            [
                              item.size ? `Size: ${item.size}` : '',
                              item.color ? `Color: ${item.color}` : '',
                            ]
                              .filter(Boolean)
                              .join(' | ')
                          )}
                        </div>
                      )}
                    </td>
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-1 border-r text-center align-top"
                    >
                      {item.hsnCode || '6203'}
                    </td>
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-1 border-r text-center align-top font-medium"
                    >
                      {item.quantity} PCS
                    </td>
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-1 border-r text-right align-top"
                    >
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td
                      style={{
                        borderColor: colors.borderPurple,
                        backgroundColor: colors.zebraTint,
                      }}
                      className="py-1.5 px-1 border-r text-right align-top"
                    >
                      {taxableVal.toFixed(2)}
                    </td>
                    <td
                      style={{ borderColor: colors.borderPurple }}
                      className="py-1.5 px-0 border-r align-top"
                    >
                      <div className="flex">
                        <div
                          className="w-[30px] text-center border-r"
                          style={{ borderColor: colors.borderPurple }}
                        >
                          {effectiveTaxPct.toFixed(1)}
                        </div>
                        <div
                          className="flex-1 text-right pr-1"
                          style={{ backgroundColor: colors.zebraTint }}
                        >
                          {itemTaxAmt.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ backgroundColor: colors.zebraTint }}
                      className="py-1.5 px-1 text-right align-top font-bold"
                    >
                      {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {/* Empty Filler Rows for Clean Consistent A4 Layout */}
              {fillerRows.map((_, fIdx) => (
                <tr
                  key={`filler-${fIdx}`}
                  style={{
                    borderBottom: `0.6px solid ${colors.borderPurple}`,
                    height: '24px',
                  }}
                >
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r"
                  />
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r"
                  />
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r"
                  />
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r"
                  />
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r"
                  />
                  <td
                    style={{
                      borderColor: colors.borderPurple,
                      backgroundColor: colors.zebraTint,
                    }}
                    className="border-r"
                  />
                  <td
                    style={{ borderColor: colors.borderPurple }}
                    className="border-r p-0"
                  >
                    <div className="flex h-full">
                      <div
                        className="w-[30px] border-r"
                        style={{ borderColor: colors.borderPurple }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: colors.zebraTint }}
                      />
                    </div>
                  </td>
                  <td style={{ backgroundColor: colors.zebraTint }} />
                </tr>
              ))}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr
                className="font-bold text-[10px]"
                style={{
                  borderTop: `0.8px solid ${colors.borderPurple}`,
                  borderBottom: `1.2px solid ${colors.borderPurple}`,
                }}
              >
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1"
                />
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1 px-2 text-right uppercase"
                >
                  Total
                </td>
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1"
                />
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1 px-1 text-center font-bold"
                >
                  {totalQty}
                </td>
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1"
                />
                <td
                  style={{
                    borderColor: colors.borderPurple,
                    backgroundColor: colors.zebraTint,
                  }}
                  className="border-r py-1 px-1 text-right"
                >
                  {taxableTotal.toFixed(2)}
                </td>
                <td
                  style={{ borderColor: colors.borderPurple }}
                  className="border-r py-1 p-0"
                >
                  <div className="flex h-full">
                    <div
                      className="w-[30px] border-r"
                      style={{ borderColor: colors.borderPurple }}
                    />
                    <div
                      className="flex-1 text-right pr-1"
                      style={{ backgroundColor: colors.zebraTint }}
                    >
                      {totalGst.toFixed(2)}
                    </div>
                  </div>
                </td>
                <td
                  style={{ backgroundColor: colors.zebraTint }}
                  className="py-1 px-1 text-right font-bold"
                >
                  {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* =================================================================== */}
        {/* 5. BOTTOM SECTION (Words, Bank/UPI, Terms & Totals Breakdown)       */}
        {/* =================================================================== */}
        <div
          className="flex mt-1.5 text-[9.5px]"
          style={{ border: `1.2px solid ${colors.borderPurple}` }}
        >
          {/* Left Column: Words, Bank/UPI, Terms (58%) */}
          <div
            className="w-[58%] flex flex-col justify-between"
            style={{ borderRight: `1px solid ${colors.borderPurple}` }}
          >
            <div>
              {/* Total in Words */}
              <SectionBanner
                title="Total in words"
                borderColor={colors.borderPurple}
              />
              <div
                className="p-1.5 text-center font-bold text-[9px] uppercase tracking-wide leading-tight"
                style={{
                  borderBottom: `0.8px solid ${colors.borderPurple}`,
                  color: colors.darkText,
                }}
              >
                {numberToWords(grandTotal)}
              </div>

              {/* Bank & Payment Details */}
              <SectionBanner
                title={isProforma ? 'Bank & Remittance Details' : 'Bank & UPI Payment Details'}
                borderColor={colors.borderPurple}
              />
              <div
                className="p-2 flex items-center justify-between gap-3"
                style={{ borderBottom: `0.8px solid ${colors.borderPurple}` }}
              >
                {/* Bank / UPI Specs */}
                <div className="space-y-1 flex-1">
                  <MetaField label="Beneficiary" value={store.storeName} isBoldValue />
                  {store.bankName && (
                    <MetaField label="Bank Name" value={store.bankName} />
                  )}
                  {store.accountNumber && (
                    <MetaField
                      label="A/C No."
                      value={store.accountNumber}
                      isBoldValue
                    />
                  )}
                  {store.ifscCode && (
                    <MetaField label="IFSC Code" value={store.ifscCode} isBoldValue />
                  )}
                  <MetaField label="UPI ID" value={cleanUpi} isBoldValue />
                  {invoice.paymentTerms && (
                    <MetaField
                      label="Terms"
                      value={invoice.paymentTerms}
                    />
                  )}
                </div>

                {/* QR Code & Badges */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="Scan UPI QR"
                    className="w-14 h-14 border border-gray-300 rounded p-0.5 bg-white shadow-sm"
                  />
                  <span className="text-[7.5px] font-bold text-center mt-1 text-gray-800">
                    Pay using UPI
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <UpiLogoBadge label="PhonePe" color="#5f259f" />
                    <UpiLogoBadge label="GPay" color="#4285F4" />
                    <UpiLogoBadge label="Paytm" color="#00BAF2" />
                    <UpiLogoBadge label="BHIM" color="#005A9C" />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions & Notes */}
            <div>
              <SectionBanner
                title="Terms and Conditions"
                borderColor={colors.borderPurple}
              />
              <div className="p-2 text-[8px] leading-relaxed text-gray-800">
                <ol className="list-decimal pl-3 space-y-0.5">
                  {isProforma ? (
                    <>
                      <li>
                        {invoice.notes ||
                          'Prices quoted are valid for 15 days from the date of this Proforma Invoice.'}
                      </li>
                      <li>
                        Production / Dispatch shall commence upon receipt of the agreed advance payment.
                      </li>
                      <li>
                        Statutory GST & levies will be charged as applicable at the time of final tax invoicing.
                      </li>
                      <li>Subject to Surat / local jurisdiction only.</li>
                    </>
                  ) : (
                    <>
                      <li>
                        {store.billFooter && store.billFooter.length > 5
                          ? store.billFooter
                          : 'Thank you for shopping with us!'}
                      </li>
                      <li>
                        Our Responsibility Ceases as soon as goods leave our Premises.
                      </li>
                      <li>Goods once sold are subject to store exchange guidelines.</li>
                      <li>Subject to local jurisdiction only.</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Authorised Signatory (42%) */}
          <div className="w-[42%] flex flex-col justify-between">
            <div className="divide-y" style={{ borderColor: colors.borderPurple }}>
              <RightSummaryRow
                label="Subtotal"
                value={totals.subtotal.toFixed(2)}
                borderColor={colors.borderPurple}
              />
              {totals.discount > 0 && (
                <RightSummaryRow
                  label="Less : Discount"
                  value={`- ${totals.discount.toFixed(2)}`}
                  borderColor={colors.borderPurple}
                />
              )}
              {hasGst && (
                <>
                  <RightSummaryRow
                    label="Taxable Amount"
                    value={totals.taxableValue.toFixed(2)}
                    borderColor={colors.borderPurple}
                  />
                  <RightSummaryRow
                    label={`Add : CGST (${totals.halfRateLabel})`}
                    value={totals.cgst.toFixed(2)}
                    borderColor={colors.borderPurple}
                  />
                  <RightSummaryRow
                    label={`Add : SGST (${totals.halfRateLabel})`}
                    value={totals.sgst.toFixed(2)}
                    borderColor={colors.borderPurple}
                  />
                  <RightSummaryRow
                    label={`Total Tax (${totals.fullRateLabel})`}
                    value={totals.totalGst.toFixed(2)}
                    borderColor={colors.borderPurple}
                  />
                </>
              )}

              {/* Grand Total Box */}
              <div
                className="flex items-center justify-between px-2 py-1.5"
                style={{
                  backgroundColor: colors.zebraTint,
                  borderBottom: `0.8px solid ${colors.borderPurple}`,
                }}
              >
                <span className="font-bold text-[10px]">
                  {isProforma
                    ? 'Total Estimated Payable'
                    : hasGst
                    ? 'Total Amount After Tax'
                    : 'Net Payable Amount'}
                </span>
                <span className="font-bold text-[12px] text-gray-950">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* (E & O.E.) */}
              <div
                className="px-2 py-0.5 text-right font-bold text-[8.5px]"
                style={{ borderBottom: `0.8px solid ${colors.borderPurple}` }}
              >
                (E & O.E.)
              </div>
            </div>

            {/* Authorised Signatory Box */}
            <div className="p-2 flex flex-col items-center justify-between min-h-[90px]">
              <div className="text-center">
                <p className="text-[7.5px] text-gray-600">
                  {isProforma
                    ? 'This is a computer-generated Proforma Invoice and represents a price quotation.'
                    : 'Certified that the particulars given above are true and correct.'}
                </p>
                <p className="text-[10px] font-bold text-gray-950 mt-0.5">
                  For {store.storeName}
                </p>
              </div>

              {/* Signature line */}
              <div
                className="w-full pt-1 text-center font-bold text-[9px] border-t"
                style={{ borderColor: colors.borderPurple }}
              >
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 6. BOTTOM COMPLIANCE FOOTER                                         */}
        {/* =================================================================== */}
        <div
          className="flex justify-between items-center text-[8px] text-gray-500 mt-2 pt-1 border-t"
          style={{ borderColor: colors.borderPurple }}
        >
          <span>
            {isProforma
              ? 'Proforma Invoice / Commercial Quotation | ZapBill POS'
              : 'Government Rule 46 Compliant GST Invoice | ZapBill POS'}
          </span>
          <span className="font-semibold">Page 1 of 1</span>
        </div>
      </div>

      {/* Embedded CSS for Exact A4 Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-wrapper {
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-container {
            width: 100% !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const MetaField: React.FC<{
  label: string;
  value: string;
  isBoldValue?: boolean;
}> = ({ label, value, isBoldValue = false }) => (
  <div className="flex items-start">
    <span className="w-[78px] shrink-0 font-bold text-gray-800">{label}:</span>
    <span
      className={`flex-1 break-words ${
        isBoldValue ? 'font-bold text-gray-950' : 'text-gray-800'
      }`}
    >
      {value}
    </span>
  </div>
);

const SectionBanner: React.FC<{ title: string; borderColor: string }> = ({
  title,
  borderColor,
}) => (
  <div
    className="text-center font-bold py-0.5 text-[9px] uppercase tracking-wide"
    style={{
      borderBottom: `0.8px solid ${borderColor}`,
      backgroundColor: '#FAF8FC',
    }}
  >
    {title}
  </div>
);

const RightSummaryRow: React.FC<{
  label: string;
  value: string;
  borderColor: string;
}> = ({ label, value, borderColor }) => (
  <div
    className="flex justify-between items-center px-2 py-1 text-[9px]"
    style={{ borderBottom: `0.6px solid ${borderColor}` }}
  >
    <span className="font-semibold text-gray-800">{label}</span>
    <span className="font-bold text-gray-950">{value}</span>
  </div>
);

const UpiLogoBadge: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => (
  <span
    className="text-[7px] font-bold px-1 py-0.5 rounded border border-gray-300 bg-white"
    style={{ color }}
  >
    {label}
  </span>
);

export default ClassicGstInvoice;

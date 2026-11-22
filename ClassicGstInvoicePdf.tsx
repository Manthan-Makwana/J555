import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Invoice, StoreSettings } from './types';
import { calculateInvoiceTotals, formatCurrency, numberToWords, sanitizeText } from './utils';

// Theme Palette matching the Flutter implementation
const purpleTheme = '#4A2574';
const borderPurple = '#5B3B8C';
const zebraTint = '#FAF8FC';
const darkText = '#111827';
const mutedText = '#4B5563';

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 22,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: darkText,
  },
  // Top Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBox: {
    width: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 46,
    height: 46,
    objectFit: 'contain',
  },
  storeInitialBadge: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: purpleTheme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInitialText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeNameSmall: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: purpleTheme,
    marginTop: 3,
    textAlign: 'center',
  },
  headerDetails: {
    flex: 1,
    paddingLeft: 12,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: purpleTheme,
    textTransform: 'uppercase',
  },
  storeAddress: {
    fontSize: 8,
    color: mutedText,
    marginTop: 2,
    lineHeight: 1.2,
  },
  storePhone: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: darkText,
    marginTop: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: purpleTheme,
    marginVertical: 4,
  },
  tagline: {
    fontSize: 7.5,
    color: mutedText,
    textAlign: 'center',
    marginBottom: 4,
  },
  // GSTIN & Title Bar
  taxInvoiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0.8,
    borderColor: borderPurple,
  },
  gstinText: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  taxInvoiceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: purpleTheme,
    textAlign: 'center',
  },
  recipientText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  // Meta Section
  metaContainer: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0.8,
    borderColor: borderPurple,
  },
  customerCol: {
    width: '42%',
    borderRightWidth: 0.8,
    borderColor: borderPurple,
  },
  sectionSubHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 2.5,
    backgroundColor: zebraTint,
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
  },
  metaBody: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  metaLabel: {
    width: 54,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  metaValue: {
    flex: 1,
    fontSize: 7.5,
  },
  invoiceMetaCol: {
    width: '58%',
    padding: 4,
  },
  invoiceMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  // Items Table
  tableContainer: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: borderPurple,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderColor: borderPurple,
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    fontSize: 7.5,
    minHeight: 24,
  },
  colSr: { width: 24, textAlign: 'center', borderRightWidth: 0.6, borderColor: borderPurple, padding: 2 },
  colName: { flex: 1, borderRightWidth: 0.6, borderColor: borderPurple, padding: 2 },
  colHsn: { width: 54, textAlign: 'center', borderRightWidth: 0.6, borderColor: borderPurple, padding: 2 },
  colQty: { width: 44, textAlign: 'center', borderRightWidth: 0.6, borderColor: borderPurple, padding: 2 },
  colRate: { width: 55, textAlign: 'right', borderRightWidth: 0.6, borderColor: borderPurple, padding: 2 },
  colTaxable: { width: 64, textAlign: 'right', borderRightWidth: 0.6, borderColor: borderPurple, padding: 2, backgroundColor: zebraTint },
  colGstGroup: { width: 82, borderRightWidth: 0.6, borderColor: borderPurple },
  colGstTop: { textAlign: 'center', borderBottomWidth: 0.6, borderColor: borderPurple, paddingVertical: 1.5, fontWeight: 'bold', fontSize: 7 },
  colGstBottom: { flexDirection: 'row' },
  colGstPct: { width: 26, textAlign: 'center', borderRightWidth: 0.6, borderColor: borderPurple, paddingVertical: 1.5, fontSize: 6.5 },
  colGstAmt: { flex: 1, textAlign: 'right', paddingVertical: 1.5, paddingRight: 2, backgroundColor: zebraTint, fontSize: 6.5 },
  colTotal: { width: 62, textAlign: 'right', padding: 2, backgroundColor: zebraTint, fontWeight: 'bold' },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: borderPurple,
    fontSize: 7.5,
    minHeight: 20,
  },
  tableFooterRow: {
    flexDirection: 'row',
    borderTopWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: borderPurple,
    fontWeight: 'bold',
    fontSize: 8,
    minHeight: 20,
    alignItems: 'center',
  },
  // Bottom Section
  bottomContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: borderPurple,
    marginTop: 4,
  },
  bottomLeft: {
    width: '58%',
    borderRightWidth: 0.8,
    borderColor: borderPurple,
  },
  bannerTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 2.5,
    backgroundColor: zebraTint,
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
  },
  wordsText: {
    padding: 4,
    fontSize: 7.2,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
  },
  termsText: {
    padding: 4,
    fontSize: 6.8,
    lineHeight: 1.3,
  },
  bottomRight: {
    width: '42%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
    fontSize: 7.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: zebraTint,
    borderBottomWidth: 0.6,
    borderColor: borderPurple,
    fontWeight: 'bold',
  },
  signatoryContainer: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  certText: {
    fontSize: 6.2,
    textAlign: 'center',
  },
  storeForText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  signLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    borderTopWidth: 0.6,
    borderColor: borderPurple,
    width: '100%',
    textAlign: 'center',
    paddingTop: 2,
  },
  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 12,
    left: 22,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderColor: borderPurple,
    paddingTop: 3,
    fontSize: 6.8,
    color: mutedText,
  },
});

export const ClassicGstInvoicePdf: React.FC<{
  invoice: Invoice;
  store: StoreSettings;
  upiUrl?: string;
}> = ({ invoice, store, upiUrl }) => {
  const cleanUpi = store.upiId?.trim() ? store.upiId.trim() : 'vogueapparels@upi';
  const gstinText = store.gstin?.trim() ? store.gstin.trim() : 'UNREGISTERED';
  const formattedDate =
    invoice.createdAt.length >= 10
      ? invoice.createdAt.substring(0, 10)
      : invoice.createdAt;

  const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const totals = calculateInvoiceTotals(invoice);
  const hasGst = totals.totalGst > 0.004;
  const taxableTotal = totals.taxableValue;
  const totalGst = totals.totalGst;
  const grandTotal = totals.grandTotal;
  const effectiveTaxPct = hasGst ? totals.effectiveTaxRatePct : 0.0;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    upiUrl || `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(store.storeName)}&am=${grandTotal.toFixed(2)}&cu=INR`
  )}`;

  // Filler rows
  const fillerCount = Math.max(0, 4 - invoice.items.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            {store.logoUrl ? (
              <Image src={store.logoUrl} style={styles.logoImage} />
            ) : (
              <View style={styles.storeInitialBadge}>
                <Text style={styles.storeInitialText}>
                  {store.storeName?.trim() ? store.storeName.trim()[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            <Text style={styles.storeNameSmall}>{store.storeName}</Text>
          </View>
          <View style={styles.headerDetails}>
            <Text style={styles.storeTitle}>{store.storeName}</Text>
            {store.address ? <Text style={styles.storeAddress}>{store.address}</Text> : null}
            {store.phone ? <Text style={styles.storePhone}>Ph: {store.phone}</Text> : null}
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.tagline}>
          {sanitizeText(
            store.billFooter && store.billFooter.length > 5
              ? store.billFooter
              : 'Premium Quality Apparel | Menswear | Womenswear | Kidswear | Ethnic & Casuals'
          )}
        </Text>

        {/* GSTIN / TAX INVOICE BAR */}
        <View style={styles.taxInvoiceBar}>
          <Text style={styles.gstinText}>GSTIN : {gstinText}</Text>
          <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>
          <Text style={styles.recipientText}>ORIGINAL FOR RECIPIENT</Text>
        </View>

        {/* Customer & Invoice Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.customerCol}>
            <Text style={styles.sectionSubHeader}>Customer Detail</Text>
            <View style={styles.metaBody}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Name:</Text>
                <Text style={[styles.metaValue, { fontWeight: 'bold' }]}>
                  {invoice.customerName || 'Walk-in Customer'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Address:</Text>
                <Text style={styles.metaValue}>{invoice.customerAddress || 'Gujarat'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PHONE:</Text>
                <Text style={styles.metaValue}>{invoice.customerPhone || '-'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>GSTIN:</Text>
                <Text style={styles.metaValue}>{invoice.customerGstin || '-'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Place of Supply:</Text>
                <Text style={styles.metaValue}>{invoice.placeOfSupply || 'Gujarat ( 24 )'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.invoiceMetaCol}>
            <View style={styles.invoiceMetaGrid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Invoice No.:</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 8 }}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Invoice Date:</Text>
                <Text style={{ fontSize: 8 }}>{formattedDate}</Text>
              </View>
            </View>
            <View style={styles.invoiceMetaGrid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Payment Mode:</Text>
                <Text style={{ fontSize: 8 }}>{invoice.paymentMode}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Reverse Charge:</Text>
                <Text style={{ fontSize: 8 }}>No</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Table Column Headers */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSr}>Sr. No.</Text>
            <Text style={styles.colName}>Name of Product / Service</Text>
            <Text style={styles.colHsn}>HSN / SAC</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colTaxable}>Taxable Value</Text>
            <View style={styles.colGstGroup}>
              <Text style={styles.colGstTop}>GST</Text>
              <View style={styles.colGstBottom}>
                <Text style={styles.colGstPct}>%</Text>
                <Text style={styles.colGstAmt}>Amount</Text>
              </View>
            </View>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => {
            const taxableVal = item.unitPrice * item.quantity;
            const itemTaxAmt = taxableVal * (effectiveTaxPct / 100);
            const lineTotal = taxableVal + itemTaxAmt;

            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colSr}>{index + 1}</Text>
                <View style={styles.colName}>
                  <Text style={{ fontWeight: 'bold' }}>{sanitizeText(item.productName)}</Text>
                  {(item.size || item.color) ? (
                    <Text style={{ color: mutedText, fontSize: 6.8, fontStyle: 'italic' }}>
                      {[item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
                        .filter(Boolean)
                        .join(' | ')}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.colHsn}>{item.hsnCode || '6203'}</Text>
                <Text style={styles.colQty}>{item.quantity} PCS</Text>
                <Text style={styles.colRate}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colTaxable}>{taxableVal.toFixed(2)}</Text>
                <View style={[styles.colGstGroup, { flexDirection: 'row' }]}>
                  <Text style={styles.colGstPct}>{effectiveTaxPct.toFixed(1)}</Text>
                  <Text style={styles.colGstAmt}>{itemTaxAmt.toFixed(2)}</Text>
                </View>
                <Text style={styles.colTotal}>{lineTotal.toFixed(2)}</Text>
              </View>
            );
          })}

          {/* Filler Rows */}
          {Array.from({ length: fillerCount }).map((_, fIdx) => (
            <View key={`filler-${fIdx}`} style={[styles.tableRow, { minHeight: 18 }]}>
              <Text style={styles.colSr} />
              <View style={styles.colName} />
              <Text style={styles.colHsn} />
              <Text style={styles.colQty} />
              <Text style={styles.colRate} />
              <Text style={styles.colTaxable} />
              <View style={[styles.colGstGroup, { flexDirection: 'row' }]}>
                <Text style={styles.colGstPct} />
                <Text style={styles.colGstAmt} />
              </View>
              <Text style={styles.colTotal} />
            </View>
          ))}

          {/* Table Footer Total */}
          <View style={styles.tableFooterRow}>
            <Text style={styles.colSr} />
            <Text style={[styles.colName, { textAlign: 'right', fontWeight: 'bold' }]}>Total</Text>
            <Text style={styles.colHsn} />
            <Text style={styles.colQty}>{totalQty}</Text>
            <Text style={styles.colRate} />
            <Text style={styles.colTaxable}>{taxableTotal.toFixed(2)}</Text>
            <View style={[styles.colGstGroup, { flexDirection: 'row' }]}>
              <Text style={styles.colGstPct} />
              <Text style={styles.colGstAmt}>{totalGst.toFixed(2)}</Text>
            </View>
            <Text style={styles.colTotal}>{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomContainer}>
          <View style={styles.bottomLeft}>
            <Text style={styles.bannerTitle}>TOTAL IN WORDS</Text>
            <Text style={styles.wordsText}>{numberToWords(grandTotal).toUpperCase()}</Text>

            <Text style={styles.bannerTitle}>BANK & UPI PAYMENT DETAILS</Text>
            <View style={styles.paymentDetailsRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Store:</Text>
                  <Text style={styles.metaValue}>{store.storeName}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Mode:</Text>
                  <Text style={styles.metaValue}>{invoice.paymentMode}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Status:</Text>
                  <Text style={styles.metaValue}>
                    {invoice.dueAmount && invoice.dueAmount > 0 ? 'Credit / Due' : 'Paid'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>UPI ID:</Text>
                  <Text style={[styles.metaValue, { fontWeight: 'bold' }]}>{cleanUpi}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Image src={qrImageUrl} style={{ width: 50, height: 50 }} />
                <Text style={{ fontSize: 6.5, fontWeight: 'bold', marginTop: 2 }}>Pay using UPI</Text>
              </View>
            </View>

            <Text style={styles.bannerTitle}>TERMS AND CONDITIONS</Text>
            <View style={styles.termsText}>
              <Text>1. {store.billFooter || 'Thank you for shopping with us!'}</Text>
              <Text>2. Our Responsibility Ceases as soon as goods leave our Premises.</Text>
              <Text>3. Goods once sold are subject to store exchange guidelines.</Text>
              <Text>4. Subject to local jurisdiction only.</Text>
            </View>
          </View>

          <View style={styles.bottomRight}>
            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: 'bold' }}>Subtotal</Text>
              <Text style={{ fontWeight: 'bold' }}>{totals.subtotal.toFixed(2)}</Text>
            </View>
            {totals.discount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={{ fontWeight: 'bold' }}>Less : Discount</Text>
                <Text style={{ fontWeight: 'bold' }}>- {totals.discount.toFixed(2)}</Text>
              </View>
            ) : null}
            {hasGst ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={{ fontWeight: 'bold' }}>Taxable Amount</Text>
                  <Text style={{ fontWeight: 'bold' }}>{totals.taxableValue.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={{ fontWeight: 'bold' }}>Add : CGST ({totals.halfRateLabel})</Text>
                  <Text style={{ fontWeight: 'bold' }}>{totals.cgst.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={{ fontWeight: 'bold' }}>Add : SGST ({totals.halfRateLabel})</Text>
                  <Text style={{ fontWeight: 'bold' }}>{totals.sgst.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={{ fontWeight: 'bold' }}>Total Tax ({totals.fullRateLabel})</Text>
                  <Text style={{ fontWeight: 'bold' }}>{totals.totalGst.toFixed(2)}</Text>
                </View>
              </>
            ) : null}

            <View style={styles.grandTotalRow}>
              <Text style={{ fontSize: 8.5 }}>
                {hasGst ? 'Total Amount After Tax' : 'Net Payable Amount'}
              </Text>
              <Text style={{ fontSize: 9.5 }}>{formatCurrency(grandTotal)}</Text>
            </View>

            <View style={[styles.summaryRow, { justifyContent: 'flex-end' }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 7 }}>(E & O.E.)</Text>
            </View>

            <View style={styles.signatoryContainer}>
              <View>
                <Text style={styles.certText}>
                  Certified that the particulars given above are true and correct.
                </Text>
                <Text style={styles.storeForText}>For {store.storeName}</Text>
              </View>
              <Text style={styles.signLabel}>Authorised Signatory</Text>
            </View>
          </View>
        </View>

        {/* Page Footer */}
        <View style={styles.pageFooter}>
          <Text>Government Rule 46 Compliant GST Invoice | ZapBill POS</Text>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClassicGstInvoicePdf;

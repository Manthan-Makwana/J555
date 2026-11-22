export type InvoiceType = 'PROFORMA_INVOICE' | 'TAX_INVOICE';

export interface InvoiceItem {
  id?: string;
  productName: string;
  size?: string;
  color?: string;
  hsnCode?: string;
  quantity: number;
  unit?: string; // Pcs, Roll, Mtr, Bundle, Kgs, Box
  unitPrice: number;
  discountPct?: number;
  taxRatePct?: number;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  cityStatePin?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  upiId?: string;
  billFooter?: string;
  logoUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountHolderName?: string;
}

export interface CustomerParty {
  name: string;
  companyName?: string;
  streetAddress: string;
  cityStatePin?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  stateCode?: string;
}

export interface ShippingDetails {
  transportName?: string;
  shippingDate?: string;
  vehicleNo?: string;
  lrNumber?: string;
  driverName?: string;
  driverPhone?: string;
  destination?: string;
}

export interface Invoice {
  invoiceType?: InvoiceType;
  invoiceNumber: string;
  createdAt: string; // YYYY-MM-DD
  dueDate?: string; // Due date / Valid until
  customerRefNo?: string; // PO / Quotation Ref
  customerId?: string;
  placeOfSupply?: string;
  reverseCharge?: string; // 'Yes' | 'No'
  paymentMode: string;
  paymentTerms?: string;

  // Financials
  discountPct?: number; // Discount in percentage e.g. 5, 10
  discount?: number; // Discount calculated amount in ₹
  deliveryCharges?: number; // Removed or optional 0

  // Parties
  customer: CustomerParty;
  shipToSameAsCustomer?: boolean;
  shipTo?: CustomerParty;

  // Logistics
  shippingDetails?: ShippingDetails;

  // Notes
  termsAndConditions?: string;
  notes?: string;

  // Items
  items: InvoiceItem[];

  // Compatibility / optional fields used by classic templates
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstin?: string;
  referenceNumber?: string;
  validUntil?: string;
  dueAmount?: number;
}

export interface InvoiceTotalsBreakdown {
  subtotal: number;
  discountPct: number;
  discount: number;
  deliveryCharges: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  grandTotal: number;
  effectiveTaxRatePct: number;
  halfRateLabel: string;
  fullRateLabel: string;
}

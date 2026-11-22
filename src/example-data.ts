import { Invoice, StoreSettings } from './types';

export const sampleStore: StoreSettings = {
  storeName: 'SHREE JI TEXTILES & APPARELS PVT LTD',
  address: 'Plot No. 91, Industrial Area, Ring Road',
  cityStatePin: 'Surat, Gujarat - 395002, India',
  phone: '+91 98765 43210',
  email: 'info@shreejitextiles.com',
  gstin: '24AAACS7409R1ZZ',
  pan: 'AAACS7409R',
  upiId: 'shreejitextiles@icici',
  billFooter: '',
  logoUrl: '',
  bankName: 'ICICI Bank',
  accountNumber: '1234567890987654',
  ifscCode: 'ICIC0007201',
  branchName: 'Karol Bagh / Ring Road Branch',
  accountHolderName: 'Shree Ji Textiles & Apparels Pvt Ltd',
};

export const sampleInvoice: Invoice = {
  invoiceType: 'PROFORMA_INVOICE',
  invoiceNumber: '0001/25-26',
  createdAt: '2026-11-22',
  dueDate: '2026-12-07',
  customerId: 'CUST-8821',
  customerRefNo: 'PO-KF-9901',
  placeOfSupply: '24 - Gujarat',
  reverseCharge: 'No',
  paymentMode: 'Bank Transfer / RTGS / UPI',
  paymentTerms: '50% Advance with PO, Balance Before Dispatch',

  discountPct: 5, // 5% Discount
  discount: 0,
  deliveryCharges: 0,

  customer: {
    name: 'Deepak Kumar',
    companyName: 'Kaveri Fashions & Retailers',
    streetAddress: '91 Spring Meadows, E3, Jhansi Road, Block E-4',
    cityStatePin: 'Dwarka, New Delhi - 110055, India',
    phone: '+91 98828 28280',
    email: 'deepak@kaverifashions.in',
    gstin: '22AAAAAA0000A1Z',
    pan: 'AAAAA0000A',
    stateCode: '07 - Delhi',
  },

  shipToSameAsCustomer: true,

  termsAndConditions:
    '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within the stipulated time.\n3. Prices quoted are valid for 15 days.\n4. Subject to Surat / local jurisdiction only.',
  notes: 'Certified that the particulars given above are true and correct.',

  items: [
    {
      id: '1',
      productName: 'Raw Silk Embroidered Kurta Fabric',
      size: '50 MTR',
      color: 'Royal Maroon & Gold',
      hsnCode: '5208',
      quantity: 4,
      unit: 'Roll',
      unitPrice: 2450.0,
    },
    {
      id: '2',
      productName: 'Fine Combed Egyptian Cotton Shirting',
      size: 'Bundle (25 Pcs)',
      color: 'Pastel Lilac / Sky Blue',
      hsnCode: '5209',
      quantity: 6,
      unit: 'Pcs',
      unitPrice: 1680.0,
    },
    {
      id: '3',
      productName: 'Designer Jacquard Waistcoat Material',
      size: '30 MTR',
      color: 'Midnight Navy',
      hsnCode: '6211',
      quantity: 2,
      unit: 'Roll',
      unitPrice: 3200.0,
    },
    {
      id: '4',
      productName: 'Premium Spun Poly-Cotton Suiting Fabric',
      size: 'Standard',
      color: 'Charcoal Grey',
      hsnCode: '6203',
      quantity: 5,
      unit: 'Pcs',
      unitPrice: 1250.0,
    },
  ],
};

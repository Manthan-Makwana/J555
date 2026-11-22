import React, { useRef, useState } from 'react';
import { Invoice, StoreSettings, InvoiceItem } from './types';
import { InvoiceTheme, getThemeHex, themePalettes } from './ProformaInvoiceA4';

interface InvoiceEditorProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  store: StoreSettings;
  setStore: React.Dispatch<React.SetStateAction<StoreSettings>>;
  theme: InvoiceTheme;
  setTheme: (t: InvoiceTheme) => void;
  isOpen: boolean;
  onToggle: () => void;
  onSaveProfile?: () => void;
  onResetDefaults?: () => void;
  onDownloadPdf?: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  setInvoice,
  store,
  setStore,
  theme,
  setTheme,
  isOpen,
  onToggle,
  onSaveProfile,
  onResetDefaults,
  onDownloadPdf,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'general' | 'customer' | 'items' | 'bank'
  >('general');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeHex = getThemeHex(theme);
  const isPreset = Object.values(themePalettes).some(
    (p) => p.primary.toLowerCase() === activeHex.toLowerCase()
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Explicit Save to LocalStorage
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('zapbill_store_profile_v1', JSON.stringify(store));
      localStorage.setItem('zapbill_theme_color_v1', theme);
      localStorage.setItem('zapbill_invoice_draft_v1', JSON.stringify(invoice));
      showToast('✓ Business profile & logo successfully saved!');
      onSaveProfile?.();
    } catch (err) {
      console.error('Storage error:', err);
      alert('Could not save to browser storage: ' + err);
    }
  };

  // High-performance logo upload with client-side canvas optimization
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert('Please choose an image file under 6 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawDataUrl = uploadEvent.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxW = 500;
          const maxH = 250;
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            if (w / h > maxW / maxH) {
              h = Math.round((h * maxW) / w);
              w = maxW;
            } else {
              w = Math.round((w * maxH) / h);
              h = maxH;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const isPng = file.type === 'image/png';
            const optimizedUrl = canvas.toDataURL(
              isPng ? 'image/png' : 'image/jpeg',
              0.92
            );
            setStore((prev) => ({ ...prev, logoUrl: optimizedUrl }));
          } else {
            setStore((prev) => ({ ...prev, logoUrl: rawDataUrl }));
          }
          showToast('✓ Logo uploaded and saved to profile!');
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setStore((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logo removed');
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = {
        ...nextItems[index],
        [field]: value,
      };
      return { ...prev, items: nextItems };
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      productName: 'New Product / Material',
      size: 'Standard',
      color: 'Default',
      hsnCode: '6203',
      quantity: 1,
      unit: 'Pcs',
      unitPrice: 1000,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) {
      alert('Invoice must have at least one line item.');
      return;
    }
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="no-print fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-5 py-3 rounded-full shadow-2xl font-semibold text-sm transition-all transform hover:scale-105 cursor-pointer"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        Edit Invoice Details & Logo
      </button>
    );
  }

  return (
    <div className="no-print w-full lg:w-[420px] bg-white border-r border-gray-200 shadow-xl flex flex-col h-full overflow-hidden shrink-0 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-50 bg-[#0F172A] text-white px-3.5 py-2 rounded-lg shadow-2xl text-xs font-semibold flex items-center justify-between border border-emerald-400/40 animate-bounce">
          <span className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">✓</span>
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#1E293B] text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>Invoice & Profile Editor</span>
            <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded uppercase">
              {invoice.invoiceType === 'PROFORMA_INVOICE' ? 'Proforma' : 'Tax Inv'}
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time updates & persistent storage
          </p>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
          title="Close Editor"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* Color Themes & Custom Color Chooser Bar */}
      <div className="bg-slate-100 px-3.5 py-2 flex items-center justify-between border-b border-gray-200 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-800">Theme:</span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700 uppercase">
            {activeHex}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Preset Color Swatches */}
          {[
            { key: 'slate', color: '#1E293B', label: 'Slate Charcoal' },
            { key: 'navy', color: '#0F2942', label: 'Corporate Navy' },
            { key: 'sage', color: '#2D5A4C', label: 'Forest Sage' },
            { key: 'purple', color: '#4A2574', label: 'Royal Purple' },
            { key: 'teal', color: '#0D9488', label: 'Industrial Teal' },
            { key: 'crimson', color: '#991B1B', label: 'Wine Crimson' },
          ].map((t) => {
            const isSelected =
              theme === t.key || theme.toLowerCase() === t.color.toLowerCase();
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.color)}
                title={t.label}
                className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                  isSelected
                    ? 'border-gray-950 scale-125 shadow-md ring-2 ring-blue-400/50'
                    : 'border-white opacity-80 hover:opacity-100 hover:scale-110 shadow-xs'
                }`}
                style={{ backgroundColor: t.color }}
              />
            );
          })}

          <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

          {/* Custom Color Chooser Input */}
          <div
            className="relative flex items-center"
            title="Pick Any Custom Brand Color"
          >
            <label
              htmlFor="custom-brand-color-picker"
              className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center shadow-xs overflow-hidden ${
                !isPreset
                  ? 'border-gray-950 scale-110 ring-2 ring-emerald-500/60'
                  : 'border-gray-300 hover:border-gray-700 hover:scale-105'
              }`}
              style={{
                background: !isPreset
                  ? activeHex
                  : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFA500 45deg, #FFFF00 90deg, #008000 135deg, #00FFFF 180deg, #0000FF 225deg, #EE82EE 270deg, #FF0000 360deg)',
              }}
            >
              <input
                id="custom-brand-color-picker"
                type="color"
                value={activeHex}
                onChange={(e) => setTheme(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              {isPreset && (
                <span className="text-[10px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none">
                  +
                </span>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold overflow-x-auto">
        <TabButton
          label="General & Logo"
          active={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
        />
        <TabButton
          label="Customer Detail"
          active={activeTab === 'customer'}
          onClick={() => setActiveTab('customer')}
        />
        <TabButton
          label={`Items (${invoice.items.length})`}
          active={activeTab === 'items'}
          onClick={() => setActiveTab('items')}
        />
        <TabButton
          label="Bank & Terms"
          active={activeTab === 'bank'}
          onClick={() => setActiveTab('bank')}
        />
      </div>

      {/* Tab Contents */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
        {/* ================================================================= */}
        {/* TAB 1: GENERAL & LOGO                                             */}
        {/* ================================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-3.5">
            {/* Auto-Save & Permanent Business Profile Storage Card */}
            <div className="p-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#1B4332] text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Save Profile & Defaults
                </span>
                <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Saved in Browser
                </span>
              </div>
              <p className="text-[10.5px] text-gray-600 leading-normal">
                Your company name, logo, address, GSTIN, and bank details are remembered automatically. You won't have to re-enter them on future visits.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 py-1.5 bg-[#1B4332] hover:bg-[#122e22] text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>💾 Save Profile Now</span>
                </button>
                {onResetDefaults && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          'Reset to demo sample data? This will restore original sample inputs.'
                        )
                      ) {
                        onResetDefaults();
                        showToast('Reset to demo sample data');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="Restore initial sample data"
                  >
                    Reset Demo
                  </button>
                )}
              </div>
            </div>

            {/* Logo Section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block font-bold text-gray-800">
                Company Brand Logo
              </label>
              <div className="flex items-center gap-3">
                {store.logoUrl ? (
                  <div className="max-h-16 max-w-28 flex items-center justify-center shrink-0">
                    <img
                      src={store.logoUrl}
                      alt="Logo"
                      className="max-h-16 max-w-28 object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="h-12 w-12 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xs shrink-0"
                    style={{ backgroundColor: activeHex }}
                  >
                    {store.storeName ? store.storeName.trim()[0].toUpperCase() : 'C'}
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="proforma-logo-upload"
                  />
                  <label
                    htmlFor="proforma-logo-upload"
                    className="inline-block px-3 py-1.5 text-white rounded font-semibold text-xs cursor-pointer transition-colors shadow-xs"
                    style={{ backgroundColor: activeHex }}
                  >
                    Upload Logo Image
                  </label>
                  {store.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="block text-[11px] text-red-600 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-gray-500">
                    PNG, JPG, or SVG. Auto-compressed & stored permanently.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Type Toggle */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Document Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setInvoice((p) => ({ ...p, invoiceType: 'PROFORMA_INVOICE' }))
                  }
                  className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                    invoice.invoiceType === 'PROFORMA_INVOICE'
                      ? 'border-[#5C8077] bg-emerald-50 text-[#5C8077] shadow-sm'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Proforma Invoice
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInvoice((p) => ({ ...p, invoiceType: 'TAX_INVOICE' }))
                  }
                  className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                    invoice.invoiceType === 'TAX_INVOICE'
                      ? 'border-[#5C8077] bg-emerald-50 text-[#5C8077] shadow-sm'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tax Invoice
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Invoice / Proforma #"
                value={invoice.invoiceNumber}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, invoiceNumber: val }))
                }
                placeholder="0001/25-26"
              />
              <InputField
                label="Customer ID"
                value={invoice.customerId || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, customerId: val }))
                }
                placeholder="CUST-8821"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Date of Issue"
                type="date"
                value={invoice.createdAt}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, createdAt: val }))
                }
              />
              <InputField
                label="Due Date / Valid Until"
                type="date"
                value={invoice.dueDate || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, dueDate: val }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Customer Ref / PO #"
                value={invoice.customerRefNo || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, customerRefNo: val }))
                }
                placeholder="PO-KF-9901"
              />
              <InputField
                label="Payment Terms"
                value={invoice.paymentTerms || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, paymentTerms: val }))
                }
                placeholder="50% Advance with PO..."
              />
            </div>

            <InputField
              label="Company Name"
              value={store.storeName}
              onChange={(val) => setStore((p) => ({ ...p, storeName: val }))}
              placeholder="e.g. SHREE JI TEXTILES & APPARELS"
            />
            <InputField
              label="Street Address"
              value={store.address}
              onChange={(val) => setStore((p) => ({ ...p, address: val }))}
              placeholder="Plot No. 91, Industrial Area"
            />
            <InputField
              label="City, State, Pin Code"
              value={store.cityStatePin || ''}
              onChange={(val) => setStore((p) => ({ ...p, cityStatePin: val }))}
              placeholder="Surat, Gujarat - 395002, India"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Phone"
                value={store.phone}
                onChange={(val) => setStore((p) => ({ ...p, phone: val }))}
                placeholder="+91 98765 43210"
              />
              <InputField
                label="Email"
                value={store.email || ''}
                onChange={(val) => setStore((p) => ({ ...p, email: val }))}
                placeholder="info@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="GSTIN NO."
                value={store.gstin || ''}
                onChange={(val) => setStore((p) => ({ ...p, gstin: val }))}
                placeholder="24AAACS7409R1ZZ"
              />
              <InputField
                label="PAN"
                value={store.pan || ''}
                onChange={(val) => setStore((p) => ({ ...p, pan: val }))}
                placeholder="AAACS7409R"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CUSTOMER DETAIL                                             */}
        {/* ================================================================= */}
        {activeTab === 'customer' && (
          <div className="space-y-3.5">
            <InputField
              label="Company / Firm Name"
              value={invoice.customer.companyName || ''}
              onChange={(val) =>
                setInvoice((p) => ({
                  ...p,
                  customer: { ...p.customer, companyName: val },
                }))
              }
              placeholder="e.g. Kaveri Fashions & Retailers"
            />
            <InputField
              label="Contact Person Name"
              value={invoice.customer.name}
              onChange={(val) =>
                setInvoice((p) => ({
                  ...p,
                  customer: { ...p.customer, name: val },
                }))
              }
              placeholder="Deepak Kumar"
            />
            <InputField
              label="Street Address"
              value={invoice.customer.streetAddress}
              onChange={(val) =>
                setInvoice((p) => ({
                  ...p,
                  customer: { ...p.customer, streetAddress: val },
                }))
              }
              placeholder="91 Spring Meadows, E3, Jhansi Road"
            />
            <InputField
              label="City, State, Pin Code"
              value={invoice.customer.cityStatePin || ''}
              onChange={(val) =>
                setInvoice((p) => ({
                  ...p,
                  customer: { ...p.customer, cityStatePin: val },
                }))
              }
              placeholder="Dwarka, New Delhi - 110055, India"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Phone"
                value={invoice.customer.phone}
                onChange={(val) =>
                  setInvoice((p) => ({
                    ...p,
                    customer: { ...p.customer, phone: val },
                  }))
                }
                placeholder="+91 98828 28280"
              />
              <InputField
                label="Email"
                value={invoice.customer.email || ''}
                onChange={(val) =>
                  setInvoice((p) => ({
                    ...p,
                    customer: { ...p.customer, email: val },
                  }))
                }
                placeholder="deepak@kaverifashions.in"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Customer GSTIN"
                value={invoice.customer.gstin || ''}
                onChange={(val) =>
                  setInvoice((p) => ({
                    ...p,
                    customer: { ...p.customer, gstin: val },
                  }))
                }
                placeholder="22AAAAAA0000A1Z"
              />
              <InputField
                label="Place of Supply"
                value={invoice.placeOfSupply || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, placeOfSupply: val }))
                }
                placeholder="24 - Gujarat"
              />
            </div>
            <InputField
              label="Customer PO / Reference #"
              value={invoice.customerRefNo || ''}
              onChange={(val) =>
                setInvoice((p) => ({ ...p, customerRefNo: val }))
              }
              placeholder="PO-KF-9901"
            />

            {/* Payment Terms Input with Presets */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <InputField
                label="Payment Terms"
                value={invoice.paymentTerms || ''}
                onChange={(val) =>
                  setInvoice((p) => ({ ...p, paymentTerms: val }))
                }
                placeholder="e.g. 50% Advance with PO, Balance Before Dispatch"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[9px] text-slate-500 font-semibold w-full">Quick Presets:</span>
                {[
                  '50% Advance with PO, Balance Before Dispatch',
                  '100% Advance Payment',
                  'Net 15 Days',
                  'Net 30 Days',
                  'Immediate Payment on Delivery',
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() =>
                      setInvoice((p) => ({ ...p, paymentTerms: term }))
                    }
                    className={`text-[9px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      invoice.paymentTerms === term
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-white border-slate-300 hover:border-slate-700 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: LINE ITEMS & PERCENTAGE DISCOUNT                           */}
        {/* ================================================================= */}
        {activeTab === 'items' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-gray-700">
                Products & Services ({invoice.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-[#5C8077] text-white rounded font-semibold text-xs hover:bg-[#4A6A62] transition-colors cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5C8077] text-xs">
                      #{index + 1} Line Item
                    </span>
                    {invoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <InputField
                    label="Description"
                    value={item.productName}
                    onChange={(val) =>
                      handleItemChange(index, 'productName', val)
                    }
                    placeholder="Product description"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="Size / Spec"
                      value={item.size || ''}
                      onChange={(val) => handleItemChange(index, 'size', val)}
                      placeholder="e.g. 50 MTR Roll"
                    />
                    <InputField
                      label="Color / Variant"
                      value={item.color || ''}
                      onChange={(val) => handleItemChange(index, 'color', val)}
                      placeholder="e.g. Royal Maroon"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <InputField
                      label="HSN"
                      value={item.hsnCode || ''}
                      onChange={(val) =>
                        handleItemChange(index, 'hsnCode', val)
                      }
                      placeholder="6203"
                    />
                    <InputField
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(val) =>
                        handleItemChange(index, 'quantity', parseFloat(val) || 1)
                      }
                    />
                    <InputField
                      label="Unit"
                      value={item.unit || 'Pcs'}
                      onChange={(val) =>
                        handleItemChange(index, 'unit', val)
                      }
                      placeholder="Pcs/Roll"
                    />
                    <InputField
                      label="Unit Price (₹)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(val) =>
                        handleItemChange(
                          index,
                          'unitPrice',
                          parseFloat(val) || 0
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Percentage-Based Discount Input */}
            <div className="pt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
              <InputField
                label="Overall Discount (%)"
                type="number"
                value={invoice.discountPct || 0}
                onChange={(val) =>
                  setInvoice((p) => ({
                    ...p,
                    discountPct: Math.max(0, parseFloat(val) || 0),
                  }))
                }
                placeholder="e.g. 5 or 10 (%)"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Enter percentage (e.g. 5 for 5% off, 10 for 10% off). Subtotal discount is calculated automatically.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: BANK REMITTANCE & TERMS                                    */}
        {/* ================================================================= */}
        {activeTab === 'bank' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
              <span className="font-bold text-[#5C8077] block">
                Bank Remittance Details & UPI QR
              </span>
              <InputField
                label="Bank Name"
                value={store.bankName || ''}
                onChange={(val) => setStore((p) => ({ ...p, bankName: val }))}
                placeholder="ICICI Bank"
              />
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Account Number"
                  value={store.accountNumber || ''}
                  onChange={(val) =>
                    setStore((p) => ({ ...p, accountNumber: val }))
                  }
                  placeholder="1234567890987654"
                />
                <InputField
                  label="IFSC Code"
                  value={store.ifscCode || ''}
                  onChange={(val) =>
                    setStore((p) => ({ ...p, ifscCode: val }))
                  }
                  placeholder="ICIC0007201"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Branch"
                  value={store.branchName || ''}
                  onChange={(val) =>
                    setStore((p) => ({ ...p, branchName: val }))
                  }
                  placeholder="Ring Road Branch"
                />
                <InputField
                  label="UPI ID"
                  value={store.upiId || ''}
                  onChange={(val) => setStore((p) => ({ ...p, upiId: val }))}
                  placeholder="shreejitextiles@icici"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Terms and Conditions
              </label>
              <textarea
                rows={4}
                value={invoice.termsAndConditions || ''}
                onChange={(e) =>
                  setInvoice((p) => ({ ...p, termsAndConditions: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded text-xs leading-relaxed"
                placeholder="1. Goods once sold will not be taken back..."
              />
            </div>

            <InputField
              label="Bottom Footer Greeting"
              value={store.billFooter || ''}
              onChange={(val) => setStore((p) => ({ ...p, billFooter: val }))}
              placeholder=""
            />
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
            </svg>
            <span>Download PDF</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          title="Print invoice"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const TabButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-2 px-3 whitespace-nowrap border-b-2 font-bold transition-all cursor-pointer ${
      active
        ? 'border-[#5C8077] text-[#5C8077] bg-white'
        : 'border-transparent text-gray-500 hover:text-gray-900'
    }`}
  >
    {label}
  </button>
);

const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#5C8077] focus:border-[#5C8077] outline-none"
    />
  </div>
);

export default InvoiceEditor;

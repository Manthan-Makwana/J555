import React, { useState, useEffect } from 'react';
import { ProformaInvoiceA4, InvoiceTheme } from './ProformaInvoiceA4';
import { ClassicGstInvoice } from './ClassicGstInvoice';
import { InvoiceEditor } from './InvoiceEditor';
import { sampleStore, sampleInvoice } from './example-data';
import { Invoice, StoreSettings } from './types';
import { downloadInvoicePdf } from './utils';

export default function App() {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    try {
      const saved = localStorage.getItem('zapbill_invoice_draft_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved invoice draft:', e);
    }
    return sampleInvoice;
  });

  const [store, setStore] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('zapbill_store_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved store profile:', e);
    }
    return sampleStore;
  });

  const [theme, setTheme] = useState<InvoiceTheme>(() => {
    try {
      const saved = localStorage.getItem('zapbill_theme_color_v1');
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load saved theme:', e);
    }
    return 'slate';
  });

  const [template, setTemplate] = useState<'vyaparProforma' | 'classicGst'>('vyaparProforma');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Auto-save store profile to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('zapbill_store_profile_v1', JSON.stringify(store));
    } catch (e) {
      console.warn('LocalStorage save failed for store:', e);
    }
  }, [store]);

  // Auto-save theme choice to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('zapbill_theme_color_v1', theme);
    } catch (e) {
      console.warn('LocalStorage save failed for theme:', e);
    }
  }, [theme]);

  // Auto-save invoice draft to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('zapbill_invoice_draft_v1', JSON.stringify(invoice));
    } catch (e) {
      console.warn('LocalStorage save failed for invoice:', e);
    }
  }, [invoice]);

  const handleResetDefaults = () => {
    setStore(sampleStore);
    setInvoice(sampleInvoice);
    setTheme('slate');
    try {
      localStorage.removeItem('zapbill_store_profile_v1');
      localStorage.removeItem('zapbill_theme_color_v1');
      localStorage.removeItem('zapbill_invoice_draft_v1');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  };

  const handleDownloadPdf = () => {
    const cleanDocType =
      invoice.invoiceType === 'TAX_INVOICE' ? 'Tax_Invoice' : 'Proforma';
    const cleanInvNum = (invoice.invoiceNumber || 'Draft').replace(
      /[\/\\?%*:|"<>]/g,
      '-'
    );
    const filename = `${cleanDocType}_${cleanInvNum}.pdf`;
    downloadInvoicePdf('printable-proforma', filename, setIsGeneratingPdf);
  };

  const isProforma = invoice.invoiceType !== 'TAX_INVOICE';

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans">
      {/* =================================================================== */}
      {/* TOP HEADER CONTROLS (Hidden during print)                           */}
      {/* =================================================================== */}
      <header className="no-print bg-[#0F172A] text-white px-5 py-2.5 shadow-md flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center font-extrabold text-base border border-white/15">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight leading-none block">
                ZapBill Proforma Studio
              </span>
              <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5 mt-0.5">
                Industrial Standard Commercial Invoice
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold normal-case text-[9px]">
                  Saved
                </span>
              </span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-700 mx-2 hidden sm:block" />

          {/* Template Style Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTemplate('vyaparProforma')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                template === 'vyaparProforma'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Industrial Proforma Standard
            </button>
            <button
              onClick={() => setTemplate('classicGst')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                template === 'classicGst'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Classic Rule 46 Grid
            </button>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Toggle Editor Drawer Button */}
          <button
            onClick={() => setIsEditorOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isEditorOpen
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-white text-[#1E293B] border-white shadow-sm hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <span>{isEditorOpen ? 'Hide Editor' : 'Edit Details & Logo'}</span>
          </button>

          {/* Zoom controls (desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="text-slate-300 hover:text-white px-1 font-bold"
              title="Zoom out"
            >
              -
            </button>
            <span className="text-[11px] font-mono text-white min-w-[32px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="text-slate-300 hover:text-white px-1 font-bold"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {/* Primary Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`px-4 py-2 rounded-lg text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] ${
              isGeneratingPdf
                ? 'bg-emerald-600 text-white cursor-wait opacity-90'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
            }`}
            title="Download PDF directly to your device"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Secondary Print / Save PDF Button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 rounded-lg text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02]"
            title="Open standard browser print dialog"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
            </svg>
            <span>Print A4</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* WORKSPACE: LEFT EDITOR PANEL + RIGHT LIVE A4 SHEET                  */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Invoice Editor */}
        <InvoiceEditor
          invoice={invoice}
          setInvoice={setInvoice}
          store={store}
          setStore={setStore}
          theme={theme}
          setTheme={setTheme}
          isOpen={isEditorOpen}
          onToggle={() => setIsEditorOpen((prev) => !prev)}
          onResetDefaults={handleResetDefaults}
          onDownloadPdf={handleDownloadPdf}
        />

        {/* Right Side: Live A4 Printable Sheet */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-200">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="shadow-2xl rounded-sm transition-all"
          >
            {template === 'vyaparProforma' ? (
              <ProformaInvoiceA4
                invoice={invoice}
                store={store}
                theme={theme}
              />
            ) : (
              <ClassicGstInvoice
                invoice={{
                  ...invoice,
                  customerName: invoice.customer.name,
                  customerPhone: invoice.customer.phone,
                  customerAddress: invoice.customer.streetAddress,
                  customerGstin: invoice.customer.gstin,
                }}
                store={store}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

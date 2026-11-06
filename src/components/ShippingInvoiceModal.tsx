import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Truck,
  IndianRupee,
  PackageCheck
} from 'lucide-react';
import { ShippingInvoice } from '../types';
import { useLedgerStore } from '../store/useLedgerStore';

interface ShippingInvoiceModalProps {
  invoice: ShippingInvoice;
  onClose: () => void;
  onConfirmDelivery?: (invoiceId: string, temp: number, note: string) => void;
  canConfirm?: boolean;
}

export const ShippingInvoiceModal: React.FC<ShippingInvoiceModalProps> = ({
  invoice,
  onClose,
  onConfirmDelivery,
  canConfirm = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [confirmTemp, setConfirmTemp] = useState<number>(19.5);
  const [confirmNote, setConfirmNote] = useState<string>('All package seals intact. Cold chain verified upon arrival.');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // Generate QR verification link for the invoice
    QRCode.toDataURL(
      `scanrx://v1/invoice?inv=${invoice.invoiceNumber}&b=${invoice.batchNumber}&q=${invoice.packQuantity}`,
      { width: 180, margin: 1 }
    ).then(setQrDataUrl);
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
================================================================================
GOVERNMENT OF INDIA · CDSCO REGISTERED PHARMACEUTICAL GST TAX INVOICE
================================================================================
Invoice No: ${invoice.invoiceNumber}
Date of Dispatch: ${invoice.dispatchDate}
Status: ${invoice.status.toUpperCase()}

CONSIGNOR (MANUFACTURER):
Company Name: ${invoice.companyName}
Facility: Baddi Industrial Complex, Solan District, HP
GSTIN: 02AABCS1429B1Z4 · Drug License: S-MNB/09/42

CONSIGNEE (DISTRIBUTOR / STOCKIST):
Distributor Name: ${invoice.distributorName}
Destination Hub: Central Pharma Logistics Freight Hub
GSTIN: 27AAACL8841F1ZV

LINE ITEMS:
Product: ${invoice.drugName}
Batch / Lot No: ${invoice.batchNumber}
HSN Code: 3004 (Medicaments)
Quantity: ${invoice.packQuantity} Units
Unit Price: ₹${invoice.unitPriceInr.toFixed(2)}
Taxable Amount: ₹${invoice.totalAmountInr.toFixed(2)}
GST (${invoice.gstPercentage}%): ₹${invoice.gstAmountInr.toFixed(2)}
--------------------------------------------------------------------------------
GRAND TOTAL (INR): ₹${invoice.grandTotalInr.toFixed(2)}
--------------------------------------------------------------------------------
Cold Chain Reading: ${invoice.temperatureReading ? invoice.temperatureReading.toFixed(1) + '°C' : '19.5°C'}
${
  invoice.deliveryConfirmation
    ? `DELIVERY CONFIRMATION:
Confirmed By: ${invoice.deliveryConfirmation.confirmedBy}
Confirmed At: ${new Date(invoice.deliveryConfirmation.confirmedAt).toLocaleString()}
Digital Signature: ${invoice.deliveryConfirmation.signature}
Note: ${invoice.deliveryConfirmation.note || 'None'}`
    : 'DELIVERY PENDING DISTRIBUTOR CONFIRMATION'
}
================================================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-4 sm:my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <FileText className="h-4 w-4 text-emerald-700" />
            <span>Pharmaceutical Tax Shipping Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Text</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>AUSHADHLEDGER CDSCO PHARMACEUTICAL SUPPLY CHAIN</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                TAX INVOICE & SHIPPING CONFIRMATION
              </h1>
              <p className="text-[11px] text-slate-500">
                Issued in accordance with the Drugs and Cosmetics Act 1940 & Central Goods and Services Tax Act 2017
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-slate-500">Date: {invoice.dispatchDate}</div>
              <div
                className={`mt-1 text-[11px] font-semibold uppercase tracking-wide ${
                  invoice.status === 'delivered_confirmed'
                    ? 'text-emerald-800'
                    : 'text-blue-800'
                }`}
              >
                {invoice.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Consignor & Consignee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Consignor (Registered Manufacturer)
              </div>
              <div className="font-bold text-sm text-slate-900">{invoice.companyName}</div>
              <div className="text-slate-600 mt-0.5">Plot No. 14, Baddi Industrial Area, Solan (HP)</div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                GSTIN: 02AABCS1429B1Z4 · Drug Lic: S-MNB/09/42 (HP)
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Consignee (Authorized Distributor / Stockist)
              </div>
              <div className="font-bold text-sm text-slate-900">{invoice.distributorName}</div>
              <div className="text-slate-600 mt-0.5">Central Logistics Depot & Cold Storage Terminal</div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                GSTIN: 27AAACL8841F1ZV · State: Maharashtra / Karnataka
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Batch No.</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3 text-right">Qty (Strips)</th>
                  <th className="p-3 text-right">Unit Price (₹)</th>
                  <th className="p-3 text-right">Taxable Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">{invoice.drugName}</td>
                  <td className="p-3 font-mono">{invoice.batchNumber}</td>
                  <td className="p-3 font-mono text-slate-500">3004</td>
                  <td className="p-3 text-right font-mono tabular-nums">{invoice.packQuantity}</td>
                  <td className="p-3 text-right font-mono tabular-nums">₹{invoice.unitPriceInr.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-semibold tabular-nums">
                    ₹{invoice.totalAmountInr.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span className="font-mono">₹{invoice.totalAmountInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrated GST (IGST {invoice.gstPercentage}%)</span>
                <span className="font-mono">₹{invoice.gstAmountInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total (INR)</span>
                <span className="font-mono text-emerald-800">₹{invoice.grandTotalInr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* QR Verification Seal & Cold Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex justify-center sm:justify-start">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Invoice QR"
                  className="h-28 w-28 rounded-lg border border-slate-200 p-1"
                />
              )}
            </div>

            <div className="sm:col-span-2 space-y-1 text-xs">
              <div className="font-bold text-slate-900">
                CDSCO Manifest Holographic QR
              </div>
              <p className="text-slate-600 text-[11px]">
                Cross-references the batch Merkle root on the national blockchain.
                Scanned by destination distributor to verify box counts and authentic leaf tokens.
              </p>
              <div className="text-[11px] font-mono text-emerald-800 font-semibold pt-1">
                Monitored Cold Chain: {invoice.temperatureReading ? invoice.temperatureReading.toFixed(1) + '°C' : '20.0°C'} (Compliant)
              </div>
            </div>
          </div>

          {/* Delivery Confirmation Section */}
          {invoice.deliveryConfirmation ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>Shipping Delivery Confirmed & Received by Distributor</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-emerald-700">Confirmed By:</span> {invoice.deliveryConfirmation.confirmedBy}
                </div>
                <div>
                  <span className="text-emerald-700">Timestamp:</span>{' '}
                  {new Date(invoice.deliveryConfirmation.confirmedAt).toLocaleString()}
                </div>
                <div className="col-span-2 font-mono text-[10px] text-slate-600">
                  <span className="text-emerald-700">Digital Seal Signature:</span>{' '}
                  {invoice.deliveryConfirmation.signature}
                </div>
              </div>
            </div>
          ) : canConfirm ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3 text-xs no-print">
              <div className="font-bold text-blue-950 flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-blue-700" />
                <span>Distributor / Stockist Inbound Receipt Confirmation</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Verify that all {invoice.packQuantity} strips and carton seals match the CDSCO manifest, then sign and accept delivery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Inbound Temperature Check (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={confirmTemp}
                    onChange={(e) => setConfirmTemp(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Acceptance Notes
                  </label>
                  <input
                    type="text"
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (onConfirmDelivery) {
                    onConfirmDelivery(invoice.id, confirmTemp, confirmNote);
                  }
                }}
                className="w-full rounded-lg bg-emerald-700 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
              >
                Sign Invoice Receipt & Confirm Stock Ingestion
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-[11px] py-2">
              Status: Awaiting Inbound Delivery Confirmation at Destination Hub
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

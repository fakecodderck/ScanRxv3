import React, { useState } from 'react';
import {
  Truck,
  Thermometer,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { ShippingInvoice } from '../types';
import { ShippingInvoiceModal } from './ShippingInvoiceModal';

export const DistributorPortal: React.FC = () => {
  const {
    batches,
    packs,
    invoices,
    confirmShippingInvoice,
    transferCustodyBatch,
    currentUser,
  } = useLedgerStore();

  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.batchNumber || '');
  const [recipientOrg, setRecipientOrg] = useState<string>('Apollo Pharmacy #402, Bengaluru');
  const [tempReading, setTempReading] = useState<number>(20.5);
  const [transferNote, setTransferNote] = useState<string>('Passed state border e-Way bill check. Cold chain maintained in refrigerated transport.');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [inspectingInvoice, setInspectingInvoice] = useState<ShippingInvoice | null>(null);

  const activeBatchObj = batches.find((b) => b.batchNumber === selectedBatch);
  const batchPacks = packs.filter((p) => p.batchNumber === selectedBatch);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    transferCustodyBatch(
      selectedBatch,
      recipientOrg,
      'pharmacy',
      currentUser.facilityLocation,
      tempReading,
      transferNote
    );

    setFeedbackMessage(
      `Custody of Batch ${selectedBatch} (${batchPacks.length} strips) signed and transferred to ${recipientOrg} on CDSCO Blockchain.`
    );

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const handleConfirmInvoice = (invoiceId: string, temp: number, note: string) => {
    confirmShippingInvoice(invoiceId, temp, note);
    setInspectingInvoice(null);
    setFeedbackMessage(`Shipping invoice confirmed & received! Packages verified and ingested into active inventory.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
          <Truck className="h-4 w-4" />
          <span>Indian Wholesale Logistics & Stockist Hub</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Distributor Verification & Shipping Confirmation
        </h1>
        <p className="text-xs text-slate-500">
          {currentUser.organization} · Verify incoming manufacturer QR shipments, confirm shipping invoices, and sign custody handovers.
        </p>
      </div>

      {feedbackMessage && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Inbound Shipping Invoices Confirmation Section */}
      <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Inbound Shipping Invoices Requiring Receipt Confirmation</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Confirm Inbound Consignments from Manufacturing Companies
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {invoices.length} Total Invoices
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      inv.status === 'delivered_confirmed'
                        ? 'text-emerald-800'
                        : 'text-amber-800'
                    }`}
                  >
                    {inv.status === 'delivered_confirmed' ? 'Delivered & Confirmed' : 'Awaiting Receipt'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  From: <span className="font-semibold text-slate-900">{inv.companyName}</span> · Product: {inv.drugName} ({inv.packQuantity} strips) · Lot: {inv.batchNumber}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-800">₹{inv.grandTotalInr.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{inv.dispatchDate}</div>
                </div>

                <button
                  onClick={() => setInspectingInvoice(inv)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
                    inv.status === 'delivered_confirmed'
                      ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {inv.status === 'delivered_confirmed' ? 'View Invoice' : 'Verify QR & Confirm Receipt'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Transfer Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Sign Forward Custody Transfer to Retail Pharmacy
            </h2>
            <p className="text-xs text-slate-500">
              Transfer verified medicine packages to retail chemist networks or dispensaries.
            </p>
          </div>

          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Batch in Warehouse</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.batchNumber} value={b.batchNumber}>
                    {b.batchNumber} — {b.drugName} ({b.totalPacks} strips)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recipient Organization (Chemist / Hospital)</label>
              <select
                value={recipientOrg}
                onChange={(e) => setRecipientOrg(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Apollo Pharmacy #402, Bengaluru">Apollo Pharmacy #402, Bengaluru (Karnataka)</option>
                <option value="MedPlus Chemist Network, Hyderabad">MedPlus Chemist Network, Hyderabad (Telangana)</option>
                <option value="Jan Aushadhi Kendra #1084, Delhi">Pradhan Mantri Jan Aushadhi Kendra #1084, Delhi</option>
                <option value="AIIMS Central Pharmacy, New Delhi">AIIMS Central Pharmacy, New Delhi</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Refrigerated Transit Temperature (°C)</span>
                <span className="font-mono text-emerald-800">{tempReading.toFixed(1)}°C</span>
              </label>
              <div className="flex items-center gap-3">
                <Thermometer className="h-4 w-4 text-emerald-700" />
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={0.5}
                  value={tempReading}
                  onChange={(e) => setTempReading(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
              {activeBatchObj && (
                <div className="mt-1 text-[11px] text-slate-500">
                  Target Spec: {activeBatchObj.temperatureSpec.min}°C – {activeBatchObj.temperatureSpec.max}°C
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interstate Handover & E-Way Bill Note</label>
              <textarea
                rows={2}
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Record Custody Handshake on CDSCO Ledger</span>
            </button>
          </form>
        </div>

        {/* Right: Active Inventory in Custody */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Stockist Warehouse Inventory
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Hub: {currentUser.facilityLocation.facilityName}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {packs.slice(0, 8).map((pack) => (
              <div key={pack.packId} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{pack.packId}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        pack.status === 'at_pharmacy'
                          ? 'text-purple-700'
                          : pack.status === 'dispensed'
                          ? 'text-emerald-800'
                          : pack.status === 'compromised'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {pack.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Batch: {pack.batchNumber}</span>
                    <span>·</span>
                    <span>Holder: {pack.currentHolder}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500">
                  {pack.lastKnownLocation ? pack.lastKnownLocation.placeName : 'In transit'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspecting Invoice Modal with Confirmation option */}
      {inspectingInvoice && (
        <ShippingInvoiceModal
          invoice={inspectingInvoice}
          canConfirm={inspectingInvoice.status !== 'delivered_confirmed'}
          onConfirmDelivery={handleConfirmInvoice}
          onClose={() => setInspectingInvoice(null)}
        />
      )}
    </div>
  );
};

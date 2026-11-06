import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  UserCheck,
  Package,
  Calendar,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Search,
  IndianRupee
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicinePack } from '../types';

export const PharmacyPortal: React.FC = () => {
  const { packs, batches, dispensePackToPatient, currentUser } = useLedgerStore();

  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [patientRef, setPatientRef] = useState<string>('RX-KA-2026-PAT-09');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dispenseSuccess, setDispenseSuccess] = useState<string | null>(null);

  const pharmacyPacks = packs.filter((p) => {
    if (searchQuery) {
      return (
        p.packId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.currentHolder.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackId || !patientRef) return;

    dispensePackToPatient(selectedPackId, patientRef);
    setDispenseSuccess(
      `Medicine strip ${selectedPackId} successfully sealed and dispensed to Patient (${patientRef}). Token lifecycle finalized on CDSCO blockchain.`
    );
    setSelectedPackId('');

    setTimeout(() => {
      setDispenseSuccess(null);
    }, 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-800">
          <Store className="h-4 w-4" />
          <span>Licensed Chemist & Retail Dispensary (India)</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Pharmacy Strip Inventory & Patient Dispensation
        </h1>
        <p className="text-xs text-slate-500">
          {currentUser.organization} · Final custody handover and token lifecycle sealing for consumer dispensation in India.
        </p>
      </div>

      {dispenseSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{dispenseSuccess}</span>
        </div>
      )}

      {/* Grid: Dispensation Form & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Dispense Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Dispense Serialized Strip to Patient
            </h2>
            <p className="text-xs text-slate-500">
              Record customer dispensation on the CDSCO blockchain ledger to prevent duplicate shelf resale or packaging cloning.
            </p>
          </div>

          <form onSubmit={handleDispense} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Strip in Inventory</label>
              <select
                value={selectedPackId}
                onChange={(e) => setSelectedPackId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              >
                <option value="">-- Choose verified medicine strip --</option>
                {packs
                  .filter((p) => p.status === 'at_pharmacy' || p.status === 'in_transit')
                  .map((p) => {
                    const batch = batches.find((b) => b.batchNumber === p.batchNumber);
                    return (
                      <option key={p.packId} value={p.packId}>
                        {p.packId} — {batch?.drugName || p.batchNumber} (MRP ₹{batch?.mrpInr?.toFixed(2) || '145.00'})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Prescription ID / Phone Ref</label>
              <input
                type="text"
                required
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                placeholder="e.g. RX-2026-PAT-4401 or +91 98765 43210"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedPackId}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Seal Strip Token & Dispense to Patient</span>
            </button>
          </form>
        </div>

        {/* Right: Shelf Inventory Table */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">
              Live Pharmacy Shelf Inventory ({pharmacyPacks.length})
            </h2>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strip ID or lot..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {pharmacyPacks.map((pack) => {
              const batch = batches.find((b) => b.batchNumber === pack.batchNumber);
              const isDispensed = pack.status === 'dispensed';
              const isCompromised = pack.status === 'compromised';

              return (
                <div key={pack.packId} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{pack.packId}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          isDispensed
                            ? 'text-emerald-800'
                            : isCompromised
                            ? 'text-rose-700'
                            : 'text-purple-700'
                        }`}
                      >
                        {pack.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      {batch?.drugName} · Lot {pack.batchNumber} · Serial {pack.serialNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>MRP: ₹{batch?.mrpInr?.toFixed(2) || '145.00'}</span>
                      <span>·</span>
                      <span>Holder: {pack.currentHolder}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {!isDispensed && !isCompromised && (
                      <button
                        onClick={() => setSelectedPackId(pack.packId)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Select to Dispense
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Store,
  CheckCircle2,
  Package,
  Calendar,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Search,
  IndianRupee,
  FileText,
  Thermometer,
  Truck,
  Check,
  Building2,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Camera,
  Activity,
  FileCheck2,
  Printer,
  Eye,
  AlertOctagon,
  Boxes,
  FileSpreadsheet,
  ScanLine,
  ChevronRight
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicineBatch, MedicinePack, ShippingInvoice } from '../types';
import { ShippingInvoiceModal } from './ShippingInvoiceModal';
import { MedicineQRCodeModal } from './MedicineQRCodeModal';

export const PharmacyPortal: React.FC = () => {
  const {
    packs,
    batches,
    invoices,
    confirmShippingInvoice,
    verifyMedicineScan,
    organizations,
    currentUser,
    pharmacyTab,
    setPharmacyTab,
  } = useLedgerStore();

  // Active Pharmacy Selection (defaults to user's pharmacy or first approved pharmacy)
  const registeredPharmacies = useMemo(() => {
    return organizations.filter((o) => o.type === 'pharmacy');
  }, [organizations]);

  const [activePharmacyName, setActivePharmacyName] = useState<string>(() => {
    const match = registeredPharmacies.find((p) =>
      currentUser.organization.toLowerCase().includes(p.name.toLowerCase())
    );
    return match ? match.name : registeredPharmacies[0]?.name || 'Apollo Pharmacy #402';
  });

  const activePharmacy = useMemo(() => {
    return (
      registeredPharmacies.find((p) => p.name === activePharmacyName) ||
      registeredPharmacies[0] || {
        id: 'org-phr-01',
        name: activePharmacyName,
        drugLicenseNo: 'KA-BGM-2023-8841',
        gstin: '29AABCA2214K1Z8',
        stateJurisdiction: 'Karnataka Drugs Control Department',
        address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
        contactEmail: 'store402@apollopharmacy.in',
        status: 'APPROVED',
      }
    );
  }, [registeredPharmacies, activePharmacyName]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedPackForQR, setSelectedPackForQR] = useState<MedicinePack | null>(null);
  const [inspectingInvoice, setInspectingInvoice] = useState<ShippingInvoice | null>(null);

  // Incoming QR verification tool
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<any | null>(null);

  // Packs in this pharmacy's custody
  const pharmacyPacks = useMemo(() => {
    return packs.filter((p) => {
      const isHolder = p.currentHolder.toLowerCase().includes(activePharmacyName.toLowerCase());
      const wasDeliveredTo = p.custodyHistory.some((c) =>
        c.toActor.toLowerCase().includes(activePharmacyName.toLowerCase())
      );
      return isHolder || wasDeliveredTo;
    });
  }, [packs, activePharmacyName]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pharmacyPacks;

    return pharmacyPacks.filter((p) => {
      const b = batches.find((batch) => batch.batchNumber === p.batchNumber);
      return (
        p.packId.toLowerCase().includes(q) ||
        p.serialNumber.toLowerCase().includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        (b && (b.drugName.toLowerCase().includes(q) || b.genericName.toLowerCase().includes(q)))
      );
    });
  }, [pharmacyPacks, searchQuery, batches]);

  // Invoices designated for this pharmacy
  const pharmacyInvoices = useMemo(() => {
    return invoices.filter((i) =>
      i.distributorName.toLowerCase().includes(activePharmacyName.toLowerCase()) ||
      i.distributorName.toLowerCase().includes('apollo')
    );
  }, [invoices, activePharmacyName]);

  // Pending confirmation invoices
  const pendingInvoices = useMemo(() => {
    return pharmacyInvoices.filter((i) => i.status !== 'delivered_confirmed');
  }, [pharmacyInvoices]);

  const handleVerifyIncomingPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) return;

    const res = verifyMedicineScan({
      scannedText: verifyTokenInput.trim(),
      userLat: 12.9716,
      userLng: 77.5946,
      placeName: `${activePharmacyName}, Bengaluru`,
      opticalAuthRequested: true,
    });

    setVerificationFeedback(res);
  };

  const handleConfirmInvoice = (invoiceId: string) => {
    confirmShippingInvoice(invoiceId, 21.0, `Accepted by ${activePharmacyName}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Pharmacy Store Card */}
      <div className="rounded-2xl border border-purple-300/80 bg-gradient-to-r from-purple-50/90 via-white to-purple-50/40 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white shadow-xs">
              <Store className="h-6 w-6 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-800">
                <span>CDSCO Registered Retail Chemist</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-purple-900 font-bold">Form 20 & 21 Licensed</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-purple-700">Certified Dispensary</span>
              </div>

              {/* Pharmacy Switcher / Title */}
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <select
                  value={activePharmacyName}
                  onChange={(e) => setActivePharmacyName(e.target.value)}
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 bg-transparent border-b-2 border-purple-600 focus:outline-none cursor-pointer py-0.5"
                >
                  {registeredPharmacies.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 uppercase">
                  {activePharmacy.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                <span>Drug License: <strong className="font-mono text-slate-800">{activePharmacy.drugLicenseNo}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>GSTIN: <strong className="font-mono text-slate-800">{activePharmacy.gstin}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{activePharmacy.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setPharmacyTab('verify')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ScanLine className="h-4 w-4 text-emerald-700" />
              <span>Verify Inbound QR</span>
            </button>

            <button
              onClick={() => setPharmacyTab('invoices')}
              className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-800 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Inbound Invoices ({pendingInvoices.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-Sidebar / Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPharmacyTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              pharmacyTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Store Overview</span>
          </button>

          <button
            onClick={() => setPharmacyTab('inventory')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              pharmacyTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Shelf Inventory ({pharmacyPacks.length})</span>
          </button>

          <button
            onClick={() => setPharmacyTab('invoices')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              pharmacyTab === 'invoices'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
            <span>Inbound Consignments ({pharmacyInvoices.length})</span>
            {pendingInvoices.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {pendingInvoices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setPharmacyTab('verify')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              pharmacyTab === 'verify'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ScanLine className="h-3.5 w-3.5 text-emerald-400" />
            <span>Scan & Verify Inbound QRs</span>
          </button>

          <button
            onClick={() => setPharmacyTab('profile')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              pharmacyTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Pharmacy License & Details</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: STORE OVERVIEW */}
      {pharmacyTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Verified Stock in Custody</span>
                <Boxes className="h-4 w-4 text-purple-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                {pharmacyPacks.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>On Shelf & Safe to Dispense</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Inbound Invoices Pending</span>
                <Truck className="h-4 w-4 text-blue-700" />
              </div>
              <div className="text-3xl font-extrabold text-blue-900 mt-2 font-mono tabular-nums">
                {pendingInvoices.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Awaiting delivery confirmation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Total Consignments</span>
                <FileSpreadsheet className="h-4 w-4 text-purple-700" />
              </div>
              <div className="text-3xl font-extrabold text-purple-900 mt-2 font-mono tabular-nums">
                {pharmacyInvoices.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Received from Manufacturers</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Storage Temperature</span>
                <Thermometer className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
                21.4°C
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Dispensary Refrigerator Calibrated</span>
              </div>
            </div>
          </div>

          {/* Pending Invoices Action Card */}
          {pendingInvoices.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-900">
                  <Truck className="h-4 w-4 text-blue-700" />
                  <span>Incoming Consignment Waiting for Acceptance</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {pendingInvoices.length} shipment invoice(s) arrived from pharmaceutical manufacturer
                </h3>
                <p className="text-xs text-slate-600">
                  Confirm receipt to update temperature records and add verified medicine packs to your active shelf inventory.
                </p>
              </div>

              <button
                onClick={() => setPharmacyTab('invoices')}
                className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-colors shrink-0 shadow-sm"
              >
                <span>Review & Accept Invoices</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Quick Shelf Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Shelf Inventory</h3>
                <p className="text-xs text-slate-500">Medicine packs verified and ready in dispensary</p>
              </div>
              <button
                onClick={() => setPharmacyTab('inventory')}
                className="text-xs font-semibold text-purple-800 hover:underline flex items-center gap-1"
              >
                <span>View full stock register</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pharmacyPacks.slice(0, 6).map((pack) => {
                const b = batches.find((batch) => batch.batchNumber === pack.batchNumber);
                return (
                  <div key={pack.packId} className="rounded-xl border border-slate-200 p-4 space-y-2 hover:border-purple-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-bold text-purple-900">{pack.packId}</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        Verified
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{b?.drugName || 'Medicine'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Lot: {pack.batchNumber} · Serial: {pack.serialNumber}</div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-600">EXP: {b?.expiryDate || '2028-02-15'}</span>
                      <button
                        onClick={() => setSelectedPackForQR(pack)}
                        className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Inspect QR</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SHELF INVENTORY & STOCK REGISTER */}
      {pharmacyTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stock by pack ID, lot number, drug name..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">
                {filteredInventory.length} pack(s) in custody
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5 text-slate-600" />
                <span>Print Stock Audit</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Pack ID</th>
                    <th className="py-3 px-4">Medicine & Formulation</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Custody Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((pack) => {
                      const b = batches.find((batch) => batch.batchNumber === pack.batchNumber);
                      return (
                        <tr key={pack.packId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-900">
                            {pack.packId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{b?.drugName || 'Medicine'}</div>
                            <div className="text-[11px] text-slate-500">{b?.genericName}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {pack.batchNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-900">
                            {pack.serialNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b?.manufacturer || 'Sun Pharma Ltd.'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {b?.expiryDate || '2028-02-15'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                              In Stock
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedPackForQR(pack)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <QrCode className="h-3 w-3 text-purple-700" />
                              <span>View QR</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No medicine packs found in shelf inventory matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INBOUND CONSIGNMENTS & INVOICES */}
      {pharmacyTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inbound Shipping Consignments</h3>
              <p className="text-xs text-slate-500">Review shipping invoices and confirm physical stock receipt</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900">
              {pharmacyInvoices.length} total invoice(s)
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Amount (₹)</th>
                    <th className="py-3 px-4">Cold-Chain Check</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pharmacyInvoices.length > 0 ? (
                    pharmacyInvoices.map((inv) => (
                      <tr key={inv.invoiceNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {inv.companyName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {inv.batchNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {inv.packQuantity} Packs
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          ₹{inv.totalAmountInr.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                          {inv.temperatureReading ? `${inv.temperatureReading}°C OK` : '4.5°C OK'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              inv.status === 'delivered_confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setInspectingInvoice(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-3 w-3 text-blue-700" />
                            <span>Sheet</span>
                          </button>

                          {inv.status !== 'delivered_confirmed' ? (
                            <button
                              onClick={() => handleConfirmInvoice(inv.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 shadow-xs"
                            >
                              <Check className="h-3 w-3" />
                              <span>Confirm & Add to Stock</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 font-mono">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Added</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No inbound consignments found for this pharmacy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SCAN & VERIFY INBOUND QRS */}
      {pharmacyTab === 'verify' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
              In-Store Dispensary Verification
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Verify Inbound Medicine Pack Authenticity
            </h2>
            <p className="text-xs text-slate-500">
              Pharmacist scans or inputs the QR code on incoming strips to check Merkle tree proof and recall status before stocking.
            </p>
          </div>

          <form onSubmit={handleVerifyIncomingPack} className="max-w-xl space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Scan or Enter Serialized Medicine QR Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                placeholder="e.g. IND-AUG-8821-0002 or scanrx://v1/verify?t=..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800 transition-colors"
              >
                Verify Pack
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Tip: You can paste any pack ID like <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-900 font-bold">IND-AUG-8821-0002</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-900 font-bold">IND-DOLO-9921-0001</code>.
            </span>
          </form>

          {/* Verification Feedback Card */}
          {verificationFeedback && (
            <div
              className={`rounded-xl border p-5 space-y-3 ${
                verificationFeedback.result === 'VERIFIED' || verificationFeedback.result === 'verified_authentic'
                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                  : 'border-rose-300 bg-rose-50/70 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                {verificationFeedback.result === 'VERIFIED' ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    <span>VERIFIED GENUINE: Safe to Stock on Pharmacy Shelf</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-rose-700" />
                    <span>AUTHENTICATION ALERT: {verificationFeedback.result}</span>
                  </>
                )}
              </div>

              {verificationFeedback.pack && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-white/80 p-3 rounded-lg border border-slate-200/60 font-mono">
                  <div>Pack ID: <strong>{verificationFeedback.pack.packId}</strong></div>
                  <div>Batch: <strong>{verificationFeedback.pack.batchNumber}</strong></div>
                  <div>Serial: <strong>{verificationFeedback.pack.serialNumber}</strong></div>
                  <div>Optical Pattern: <strong className="text-emerald-700">Enrolled</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: PHARMACY LICENSE & DETAILS */}
      {pharmacyTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
              CDSCO Retail Pharmacy License & Registration
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {activePharmacy.name}
            </h2>
            <p className="text-xs text-slate-500">
              Authorized chemist store details, pharmacist credentials, and retail drug licenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-purple-700" />
                <span>Drug Retail Licenses (Form 20 & 21)</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div>License Form: <strong className="text-slate-900">Form 20 (General Drugs) & Form 21 (Specified Schedule C/C1)</strong></div>
                <div>License Number: <strong className="font-mono text-slate-900">{activePharmacy.drugLicenseNo}</strong></div>
                <div>Licensing Authority: <strong className="text-slate-900">{activePharmacy.stateJurisdiction}</strong></div>
                <div>Status: <span className="font-bold text-emerald-800 uppercase">{activePharmacy.status}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Store className="h-4 w-4 text-purple-700" />
                <span>Store Premises & Tax Compliance</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div>GSTIN: <strong className="font-mono text-slate-900">{activePharmacy.gstin}</strong></div>
                <div>Dispensary Address: <strong className="text-slate-900">{activePharmacy.address}</strong></div>
                <div>Official Email: <strong className="text-slate-900">{activePharmacy.contactEmail}</strong></div>
                <div>Pharmacist in Charge: <strong className="text-purple-900">Dr. Ramesh Rao (Reg #KSPC-44109)</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedPackForQR && (
        <MedicineQRCodeModal
          pack={selectedPackForQR}
          batch={batches.find((b) => b.batchNumber === selectedPackForQR.batchNumber)}
          onClose={() => setSelectedPackForQR(null)}
        />
      )}

      {/* Invoice Viewer Modal */}
      {inspectingInvoice && (
        <ShippingInvoiceModal
          invoice={inspectingInvoice}
          onClose={() => setInspectingInvoice(null)}
        />
      )}
    </div>
  );
};

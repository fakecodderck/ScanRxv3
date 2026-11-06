import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  Plus,
  QrCode,
  Layers,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
  ExternalLink,
  ShieldAlert,
  Building2,
  Calendar,
  Lock,
  X,
  FileText,
  Edit3,
  Send,
  IndianRupee
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicineBatch, MedicinePack, ShippingInvoice } from '../types';
import { ShippingInvoiceModal } from './ShippingInvoiceModal';

export const ManufacturerPortal: React.FC = () => {
  const {
    batches,
    packs,
    invoices,
    mintNewBatch,
    updateBatchDetails,
    createShippingInvoice,
    recallBatch,
    currentUser,
  } = useLedgerStore();

  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [selectedBatchForQRs, setSelectedBatchForQRs] = useState<MedicineBatch | null>(null);
  const [generatedQRs, setGeneratedQRs] = useState<{ pack: MedicinePack; qrDataUrl: string }[]>([]);
  const [batchQRUrl, setBatchQRUrl] = useState<string>('');
  const [loadingQRs, setLoadingQRs] = useState<boolean>(false);

  // Edit batch state
  const [editingBatch, setEditingBatch] = useState<MedicineBatch | null>(null);

  // Shipping invoice generation state
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    batchNumber: batches[0]?.batchNumber || '',
    distributorName: 'Coldex National Logistics Hub, Bhiwandi',
    packQuantity: 6,
    unitPriceInr: 180.00,
    gstPercentage: 12,
    dispatchDate: new Date().toISOString().split('T')[0],
  });
  const [viewingInvoice, setViewingInvoice] = useState<ShippingInvoice | null>(null);

  // Minting form state with Indian pharma defaults
  const [formData, setFormData] = useState({
    drugName: 'Azithral 500 Tablets IP',
    genericName: 'Azithromycin Tablets IP 500mg',
    dosageForm: '500mg Film-Coated Strip (5 Tablets)',
    ndcCode: 'CDSCO/GJ/AZI-500',
    mfgLicenseNo: 'G/25/1842 (Gujarat)',
    mrpInr: 132.50,
    totalPacks: 6,
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 730).toISOString().split('T')[0],
    tempMin: 15,
    tempMax: 30,
  });

  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = mintNewBatch(formData);
    setIsMinting(false);

    const mintedBatch = useLedgerStore.getState().batches.find((b) => b.batchNumber === result.batchNumber);
    if (mintedBatch) {
      handleOpenQRModal(mintedBatch);
    }
  };

  const handleOpenQRModal = async (batch: MedicineBatch) => {
    setSelectedBatchForQRs(batch);
    setLoadingQRs(true);

    try {
      const batchUrl = await QRCode.toDataURL(
        `meditrust://v1/batch?b=${batch.batchNumber}&root=${batch.merkleRoot}`,
        { width: 300, margin: 1 }
      );
      setBatchQRUrl(batchUrl);

      const batchPacks = packs.filter((p) => p.batchNumber === batch.batchNumber);
      const qrs = await Promise.all(
        batchPacks.map(async (pack) => {
          const qr = await QRCode.toDataURL(pack.secureToken, { width: 250, margin: 1 });
          return { pack, qrDataUrl: qr };
        })
      );
      setGeneratedQRs(qrs);
    } catch (err) {
      console.error('QR generation error:', err);
    } finally {
      setLoadingQRs(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    updateBatchDetails(editingBatch.batchNumber, {
      drugName: editingBatch.drugName,
      dosageForm: editingBatch.dosageForm,
      mrpInr: editingBatch.mrpInr,
      temperatureSpec: editingBatch.temperatureSpec,
    });
    setEditingBatch(null);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createShippingInvoice(invoiceForm);
    setIsCreatingInvoice(false);
    setViewingInvoice(created);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Building2 className="h-4 w-4 text-emerald-700" />
            <span>CDSCO Certified Manufacturing Unit (Company Portal)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Pharmaceutical Company Management Portal
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser.organization} · Generate QR codes, edit drug details, and issue GST shipping invoices for distributors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreatingInvoice(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-4 w-4 text-blue-700" />
            <span>Generate Shipping Invoice</span>
          </button>

          <button
            onClick={() => setIsMinting(!isMinting)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Mint Medicine Batch & QRs</span>
          </button>
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {isCreatingInvoice && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Generate GST Tax Shipping Invoice for Distributor</span>
            </div>
            <button
              onClick={() => setIsCreatingInvoice(false)}
              className="rounded p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateInvoiceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Batch to Ship</label>
              <select
                value={invoiceForm.batchNumber}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, batchNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.batchNumber} value={b.batchNumber}>
                    {b.batchNumber} — {b.drugName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Distributor / Stockist</label>
              <select
                value={invoiceForm.distributorName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, distributorName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Coldex National Logistics Hub, Bhiwandi">Coldex National Logistics Hub, Bhiwandi (MH)</option>
                <option value="Apollo Pharmacy #402, Bengaluru">Apollo Pharmacy #402, Bengaluru (KA)</option>
                <option value="MedPlus Pharma Distribution, Hyderabad">MedPlus Distribution, Hyderabad (TS)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity of Strips</label>
              <input
                type="number"
                min={1}
                max={100}
                value={invoiceForm.packQuantity}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, packQuantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Base Price (₹ Excl. GST)</label>
              <input
                type="number"
                step="0.5"
                value={invoiceForm.unitPriceInr}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, unitPriceInr: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                value={invoiceForm.gstPercentage}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Dispatch</label>
              <input
                type="date"
                value={invoiceForm.dispatchDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dispatchDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingInvoice(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
              >
                Generate GST Shipping Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Minting Form Drawer */}
      {isMinting && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm space-y-5 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Layers className="h-4 w-4 text-emerald-700" />
              <span>Pharmaceutical Batch Formulation & CDSCO Merkle Tree Parameters</span>
            </div>
            <button
              onClick={() => setIsMinting(false)}
              className="rounded p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleMintSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commercial Brand Name</label>
              <input
                type="text"
                required
                value={formData.drugName}
                onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name (Indian Pharmacopoeia)</label>
              <input
                type="text"
                required
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage Form & Packaging</label>
              <input
                type="text"
                required
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CDSCO Registration Ref / Code</label>
              <input
                type="text"
                required
                value={formData.ndcCode}
                onChange={(e) => setFormData({ ...formData, ndcCode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacturing License No.</label>
              <input
                type="text"
                required
                value={formData.mfgLicenseNo}
                onChange={(e) => setFormData({ ...formData, mfgLicenseNo: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Retail Price (₹ MRP)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.mrpInr}
                onChange={(e) => setFormData({ ...formData, mrpInr: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strip Serialization Count</label>
              <input
                type="number"
                min={1}
                max={48}
                value={formData.totalPacks}
                onChange={(e) => setFormData({ ...formData, totalPacks: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacture Date</label>
              <input
                type="date"
                required
                value={formData.mfgDate}
                onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Temperature (°C)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.tempMin}
                  onChange={(e) => setFormData({ ...formData, tempMin: Number(e.target.value) })}
                  className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-900 font-mono text-center"
                  placeholder="Min °C"
                />
                <input
                  type="number"
                  value={formData.tempMax}
                  onChange={(e) => setFormData({ ...formData, tempMax: Number(e.target.value) })}
                  className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-900 font-mono text-center"
                  placeholder="Max °C"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsMinting(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
              >
                Sign & Mint Batch onto CDSCO Blockchain
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-xs text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-700" />
                <span>Edit Batch QR Details · {editingBatch.batchNumber}</span>
              </h3>
              <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drug Formulation Name</label>
                <input
                  type="text"
                  value={editingBatch.drugName}
                  onChange={(e) => setEditingBatch({ ...editingBatch, drugName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage Form</label>
                <input
                  type="text"
                  value={editingBatch.dosageForm}
                  onChange={(e) => setEditingBatch({ ...editingBatch, dosageForm: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">MRP in ₹</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBatch.mrpInr || 0}
                  onChange={(e) => setEditingBatch({ ...editingBatch, mrpInr: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  Save Batch Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batches Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Registered Indian Formulations & Batches ({batches.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {packs.length} Unit Strips Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Batch No.</th>
                <th className="px-4 py-3">Medicine Formulation</th>
                <th className="px-4 py-3">Mfg Lic No.</th>
                <th className="px-4 py-3">MRP (₹)</th>
                <th className="px-4 py-3">Packs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch) => (
                <tr key={batch.batchNumber} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {batch.batchNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{batch.drugName}</div>
                    <div className="text-[11px] text-slate-500">{batch.dosageForm}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                    {batch.mfgLicenseNo || 'CDSCO-LIC'}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-emerald-800 whitespace-nowrap">
                    ₹{batch.mrpInr ? batch.mrpInr.toFixed(2) : '145.00'}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-700">
                    {batch.totalPacks} strips
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {batch.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Active Lot</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <span>CDSCO Recalled</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenQRModal(batch)}
                        className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                        <span>QRs</span>
                      </button>

                      <button
                        onClick={() => setEditingBatch({ ...batch })}
                        className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      {batch.status === 'active' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Specify CDSCO Section 26A Recall Grounds:');
                            if (reason) recallBatch(batch.batchNumber, reason);
                          }}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Recall
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Invoices Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Generated Shipping Invoices for Distributors ({invoices.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCreatingInvoice(true)}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            + Create Invoice
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      inv.status === 'delivered_confirmed'
                        ? 'text-emerald-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {inv.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Shipped to: <span className="font-semibold text-slate-900">{inv.distributorName}</span> · Product: {inv.drugName} (Qty: {inv.packQuantity} strips)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-emerald-800">₹{inv.grandTotalInr.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{inv.dispatchDate}</div>
                </div>

                <button
                  onClick={() => setViewingInvoice(inv)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View / Print
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viewing Invoice Modal */}
      {viewingInvoice && (
        <ShippingInvoiceModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* QR Codes Print Matrix Modal */}
      {selectedBatchForQRs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Serialized Blister Strip Labels · {selectedBatchForQRs.drugName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Batch: {selectedBatchForQRs.batchNumber} · Lic: {selectedBatchForQRs.mfgLicenseNo} · MRP: ₹{selectedBatchForQRs.mrpInr?.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForQRs(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col sm:flex-row items-center gap-5">
                {batchQRUrl && (
                  <img
                    src={batchQRUrl}
                    alt="Batch Master QR"
                    className="h-32 w-32 rounded-lg border border-emerald-300 bg-white p-1 shadow-xs"
                  />
                )}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Master Shipper Carton Aggregate QR
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    Master Carton for {selectedBatchForQRs.totalPacks} Serialized Indian Medicine Strips
                  </div>
                  <p className="text-slate-600">
                    Scanned at wholesale clearing and distribution centers (Bhiwandi / Delhi) prior to retail chemist dispatch.
                  </p>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Individual Blister Strip Unit Cryptographic Tokens ({generatedQRs.length})
                </div>

                {loadingQRs ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Rendering cryptographic matrix...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {generatedQRs.map(({ pack, qrDataUrl }) => (
                      <div
                        key={pack.packId}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 hover:border-emerald-500 hover:shadow-xs transition-all text-center"
                      >
                        <div className="text-[11px] font-bold font-mono text-slate-900">
                          {pack.packId}
                        </div>
                        <div className="mx-auto flex justify-center">
                          <img
                            src={qrDataUrl}
                            alt={pack.packId}
                            className="h-36 w-36 rounded border border-slate-100 p-1"
                          />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Strip: <span className="text-slate-900 font-semibold">{pack.serialNumber}</span>
                        </div>

                        <div className="pt-1 flex items-center justify-center gap-1.5">
                          <a
                            href={qrDataUrl}
                            download={`Strip_QR_${pack.packId}.png`}
                            className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download PNG</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBatchForQRs(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

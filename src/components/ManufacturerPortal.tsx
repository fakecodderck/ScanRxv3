import React, { useState, useMemo } from 'react';
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
  IndianRupee,
  Search,
  Sparkles,
  MapPin,
  RefreshCw,
  Eye,
  Check,
  ChevronRight,
  Boxes,
  Activity,
  Award,
  Truck,
  PlusCircle,
  FileCheck2,
  Thermometer,
  ShieldCheck,
  SlidersHorizontal,
  Building,
  Trash2
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicineBatch, MedicinePack, ShippingInvoice } from '../types';
import { ShippingInvoiceModal } from './ShippingInvoiceModal';
import { MedicineQRCodeModal } from './MedicineQRCodeModal';

export const ManufacturerPortal: React.FC = () => {
  const {
    batches,
    packs,
    invoices,
    mintNewBatch,
    updateBatchDetails,
    createShippingInvoice,
    recallBatch,
    deletePack,
    deleteBatch,
    currentUser,
    organizations,
    companyTab,
    setCompanyTab,
  } = useLedgerStore();

  // Active Company Selection (defaults to user's company or first approved manufacturer)
  const registeredCompanies = useMemo(() => {
    return organizations.filter((o) => o.type === 'manufacturer');
  }, [organizations]);

  const [activeCompanyName, setActiveCompanyName] = useState<string>(() => {
    const match = registeredCompanies.find((c) =>
      currentUser.organization.toLowerCase().includes(c.name.toLowerCase())
    );
    return match ? match.name : registeredCompanies[0]?.name || 'Sun Pharma Laboratories Ltd.';
  });

  const activeCompany = useMemo(() => {
    return (
      registeredCompanies.find((c) => c.name === activeCompanyName) ||
      registeredCompanies[0] || {
        id: 'org-mfr-01',
        name: activeCompanyName,
        drugLicenseNo: 'S-MNB/09/42 (Himachal Pradesh)',
        gstin: '02AABCS1429B1Z4',
        stateJurisdiction: 'Himachal Pradesh State Drugs Controller',
        address: 'Plot 2, Baddi Industrial Complex, Solan, HP 173205',
        contactEmail: 'compliance@sunpharma.in',
        status: 'APPROVED',
      }
    );
  }, [registeredCompanies, activeCompanyName]);

  // QR Modal States
  const [selectedBatchForQRs, setSelectedBatchForQRs] = useState<MedicineBatch | null>(null);
  const [generatedQRs, setGeneratedQRs] = useState<{ pack: MedicinePack; qrDataUrl: string }[]>([]);
  const [batchQRUrl, setBatchQRUrl] = useState<string>('');
  const [loadingQRs, setLoadingQRs] = useState<boolean>(false);

  // Single Pack QR Modal
  const [selectedPackForModal, setSelectedPackForModal] = useState<MedicinePack | null>(null);

  // Edit batch state
  const [editingBatch, setEditingBatch] = useState<MedicineBatch | null>(null);

  // Shipping invoice generation state
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    batchNumber: '',
    distributorName: 'Apollo Pharmacy #402, Bengaluru',
    packQuantity: 6,
    unitPriceInr: 180.0,
    gstPercentage: 12,
    dispatchDate: new Date().toISOString().split('T')[0],
  });
  const [viewingInvoice, setViewingInvoice] = useState<ShippingInvoice | null>(null);

  // Search in QR codes list & batches list
  const [qrSearchQuery, setQrSearchQuery] = useState<string>('');
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');

  // Minting form state with Indian pharma compliance fields
  const [formData, setFormData] = useState({
    batchNumber: 'LOT-AZI-2026',
    drugName: 'Azithral 500 Tablets IP',
    genericName: 'Azithromycin Tablets IP 500mg',
    dosageForm: 'Strip of 5 Tablets (Film-Coated Blister Foil)',
    ndcCode: 'CDSCO/HP/AZI-500',
    mfgLicenseNo: activeCompany?.drugLicenseNo || 'S-MNB/09/42 (HP)',
    totalPacks: 8, // Company can set number of medicine QR codes
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 730).toISOString().split('T')[0],
    tempMin: 15,
    tempMax: 30,
  });

  const handleCompanyChange = (companyName: string) => {
    setActiveCompanyName(companyName);
    const found = registeredCompanies.find((c) => c.name === companyName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        mfgLicenseNo: found.drugLicenseNo,
      }));
    }
  };

  const handleGenerateBatchNo = () => {
    const prefix = formData.drugName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'MED';
    const seq = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      batchNumber: `LOT-${prefix}-${seq}`,
    }));
  };

  // Batches belonging to active company
  const companyBatches = useMemo(() => {
    return batches.filter((b) =>
      b.manufacturer.toLowerCase().includes(activeCompanyName.toLowerCase())
    );
  }, [batches, activeCompanyName]);

  // Serialized packs belonging to active company
  const companyPacks = useMemo(() => {
    const batchNumbers = companyBatches.map((b) => b.batchNumber);
    return packs.filter((p) => batchNumbers.includes(p.batchNumber));
  }, [packs, companyBatches]);

  // Filtered batches
  const filteredCompanyBatches = useMemo(() => {
    const q = batchSearchQuery.toLowerCase().trim();
    return companyBatches.filter((b) => {
      const matchesQuery =
        !q ||
        b.batchNumber.toLowerCase().includes(q) ||
        b.drugName.toLowerCase().includes(q) ||
        b.genericName.toLowerCase().includes(q);
      const matchesStatus =
        selectedBatchFilter === 'ALL' || b.status.toUpperCase() === selectedBatchFilter;
      return matchesQuery && matchesStatus;
    });
  }, [companyBatches, batchSearchQuery, selectedBatchFilter]);

  // Filtered packs for QR Explorer
  const filteredCompanyPacks = useMemo(() => {
    const q = qrSearchQuery.toLowerCase().trim();
    if (!q) return companyPacks;

    return companyPacks.filter((p) => {
      const b = batches.find((batch) => batch.batchNumber === p.batchNumber);
      return (
        p.packId.toLowerCase().includes(q) ||
        p.serialNumber.toLowerCase().includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        (b && (b.drugName.toLowerCase().includes(q) || b.genericName.toLowerCase().includes(q)))
      );
    });
  }, [companyPacks, qrSearchQuery, batches]);

  // Invoices originating from active company
  const companyInvoices = useMemo(() => {
    return invoices.filter((i) =>
      i.companyName.toLowerCase().includes(activeCompanyName.toLowerCase())
    );
  }, [invoices, activeCompanyName]);

  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = mintNewBatch({
      ...formData,
      companyName: activeCompanyName,
    });

    const mintedBatch = useLedgerStore
      .getState()
      .batches.find((b) => b.batchNumber === result.batchNumber);

    if (mintedBatch) {
      handleOpenQRModal(mintedBatch);
      setCompanyTab('qrcodes');
    }
  };

  const handleOpenQRModal = async (batch: MedicineBatch) => {
    setSelectedBatchForQRs(batch);
    setLoadingQRs(true);

    try {
      const batchUrl = await QRCode.toDataURL(
        `scanrx://v1/batch?b=${batch.batchNumber}&root=${batch.merkleRoot}&app=scanrx`,
        { width: 300, margin: 1 }
      );
      setBatchQRUrl(batchUrl);

      const batchPacks = packs.filter((p) => p.batchNumber === batch.batchNumber);
      const qrs = await Promise.all(
        batchPacks.map(async (pack) => {
          const qr = await QRCode.toDataURL(pack.secureToken, {
            width: 250,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
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
      temperatureSpec: editingBatch.temperatureSpec,
    });
    setEditingBatch(null);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createShippingInvoice({
      ...invoiceForm,
      batchNumber: invoiceForm.batchNumber || companyBatches[0]?.batchNumber || 'LOT-AUG-8821',
    });
    setIsCreatingInvoice(false);
    setViewingInvoice(created);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Company Executive Card */}
      <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/40 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Building2 className="h-6 w-6 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <span>CDSCO Registered Manufacturer</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-900 font-bold">Form 25/28 Licensed</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-700">Schedule M GMP</span>
              </div>

              {/* Company Switcher / Title */}
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <select
                  value={activeCompanyName}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 bg-transparent border-b-2 border-emerald-600 focus:outline-none cursor-pointer py-0.5"
                >
                  {registeredCompanies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 uppercase">
                  {activeCompany.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                <span>Mfg License: <strong className="font-mono text-slate-800">{activeCompany.drugLicenseNo}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>GSTIN: <strong className="font-mono text-slate-800">{activeCompany.gstin}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{activeCompany.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setInvoiceForm((prev) => ({
                  ...prev,
                  batchNumber: companyBatches[0]?.batchNumber || '',
                }));
                setIsCreatingInvoice(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Issue Shipping Invoice</span>
            </button>

            <button
              onClick={() => setCompanyTab('create')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Unique QRs (New Batch)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-Sidebar / Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto gap-2 scrollbar-none whitespace-nowrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setCompanyTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setCompanyTab('batches')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'batches'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Medicine Batches ({companyBatches.length})</span>
          </button>

          <button
            onClick={() => setCompanyTab('create')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'create'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Generate Unique QRs</span>
          </button>

          <button
            onClick={() => setCompanyTab('qrcodes')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'qrcodes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Matrix & Print ({companyPacks.length})</span>
          </button>

          <button
            onClick={() => setCompanyTab('invoices')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'invoices'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Shipping Invoices ({companyInvoices.length})</span>
          </button>

          <button
            onClick={() => setCompanyTab('profile')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              companyTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Company Profile & Licenses</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {companyTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Registered Batches</span>
                <Boxes className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                {companyBatches.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>Active on Merkle Blockchain</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Unique Serialized QRs</span>
                <QrCode className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-800 mt-2 font-mono tabular-nums">
                {companyPacks.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Unique individual QR per pack</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Dispatched Invoices</span>
                <Truck className="h-4 w-4 text-blue-700" />
              </div>
              <div className="text-3xl font-extrabold text-blue-900 mt-2 font-mono tabular-nums">
                {companyInvoices.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>To Distributors & Pharmacies</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">Cold-Chain Passed</span>
                <Thermometer className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
                100%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>All consignments in 15°C - 30°C</span>
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Ready to manufacture a new medicine batch?
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                Define the medicine formulation, composition, and number of packs. The system will auto-generate unique cryptographic QR codes for each individual medicine pack.
              </p>
            </div>
            <button
              onClick={() => setCompanyTab('create')}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shrink-0 shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Launch Batch Minting</span>
            </button>
          </div>

          {/* Recent Batches Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Medicine Batches</h3>
                <p className="text-xs text-slate-500">Latest formulations minted by {activeCompanyName}</p>
              </div>
              <button
                onClick={() => setCompanyTab('batches')}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>View all batches</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyBatches.slice(0, 3).map((b) => (
                <div key={b.batchNumber} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-emerald-500 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-800">{b.batchNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900">{b.drugName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{b.genericName}</p>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                      {b.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>{b.totalPacks} Unique QRs</span>
                    <div className="flex items-center gap-2.5 font-sans">
                      <button
                        onClick={() => handleOpenQRModal(b)}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Print QRs</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Batch ${b.batchNumber} and all its associated QR codes?`)) {
                            deleteBatch(b.batchNumber);
                          }
                        }}
                        className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                        title="Delete Batch and all associated QRs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MEDICINE BATCHES */}
      {companyTab === 'batches' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
                placeholder="Search by lot number, drug name..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="RECALLED">Recalled</option>
                <option value="QUARANTINED">Quarantined</option>
              </select>

              <button
                onClick={() => setCompanyTab('create')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>New Batch</span>
              </button>
            </div>
          </div>

          {/* Batches Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Batch / Lot</th>
                    <th className="py-3 px-4">Medicine & Formulation</th>
                    <th className="py-3 px-4">Composition</th>
                    <th className="py-3 px-4">Serialized QRs</th>
                    <th className="py-3 px-4">MFD · EXP</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanyBatches.length > 0 ? (
                    filteredCompanyBatches.map((batch) => (
                      <tr key={batch.batchNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                          {batch.batchNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{batch.drugName}</div>
                          <div className="text-[11px] text-slate-500">{batch.dosageForm}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                          {batch.genericName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {batch.totalPacks} Packs
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div>MFD: {batch.mfgDate}</div>
                          <div className="text-slate-400">EXP: {batch.expiryDate}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              batch.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : batch.status === 'recalled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {batch.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenQRModal(batch)}
                            title="Inspect and Print All Unique QRs"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <QrCode className="h-3 w-3 text-emerald-700" />
                            <span>QRs</span>
                          </button>

                          <button
                            onClick={() => setEditingBatch(batch)}
                            title="Edit Formulation Specifications"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="h-3 w-3 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          {batch.status === 'active' && (
                            <button
                              onClick={() => {
                                if (confirm(`Recall Batch ${batch.batchNumber} under CDSCO Section 26A?`)) {
                                  recallBatch(batch.batchNumber, 'Quality Control Audit Quarantine');
                                }
                              }}
                              title="Recall under CDSCO Section 26A"
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span>Recall</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete Batch ${batch.batchNumber} and all its associated ${batch.totalPacks} QR codes?`)) {
                                deleteBatch(batch.batchNumber);
                              }
                            }}
                            title="Delete Batch & All QRs"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No medicine batches match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GENERATE UNIQUE QRS (BATCH MINTING WORKSPACE) */}
      {companyTab === 'create' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Production Line Minting Workspace
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Generate Unique Serialized QRs for New Medicine Batch
            </h2>
            <p className="text-xs text-slate-500">
              Each medicine pack gets its own unique cryptographically signed QR code auto-generated by the system.
            </p>
          </div>

          <form onSubmit={handleMintSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Drug Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Medicine Brand / Drug Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  placeholder="e.g. Augmentin 625 Duo Tablets"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Composition */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Active Composition / Formulation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Amoxicillin 500mg + Clavulanic Acid 125mg IP"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Batch Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Batch / Lot Number *</label>
                  <button
                    type="button"
                    onClick={handleGenerateBatchNo}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="e.g. LOT-AUG-8821"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Number of Packs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Number of Medicine Packs to Generate *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={formData.totalPacks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPacks: parseInt(e.target.value) || 1 })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Creates {formData.totalPacks} unique serialized QR tokens for this batch.
                </span>
              </div>

              {/* Dosage Form */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Packaging Specification</label>
                <input
                  type="text"
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  placeholder="e.g. Strip of 10 Tablets (Blister Foil)"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* MFD */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturing Date (MFD)</label>
                <input
                  type="date"
                  required
                  value={formData.mfgDate}
                  onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiration Date (EXP)</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Temp Storage */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Storage Temp Bounds (°C)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formData.tempMin}
                    onChange={(e) =>
                      setFormData({ ...formData, tempMin: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Min °C"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={formData.tempMax}
                    onChange={(e) =>
                      setFormData({ ...formData, tempMax: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Max °C"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cryptographic Preview Box */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>National Blockchain Merkle Tree Serialization</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Every pack in this batch will be assigned an HMAC-signed token, leaf hash, and physical optical security pattern enrolled on the ledger.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Mint Batch & Generate {formData.totalPacks} QRs</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: QR CODE EXPLORER & PRINT MATRIX */}
      {companyTab === 'qrcodes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={qrSearchQuery}
                onChange={(e) => setQrSearchQuery(e.target.value)}
                placeholder="Search serialized pack ID (e.g. IND-AUG-8821-0002)..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total {filteredCompanyPacks.length} packs in inventory
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanyPacks.map((pack) => {
              const b = batches.find((batch) => batch.batchNumber === pack.batchNumber);
              return (
                <div
                  key={pack.packId}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-emerald-500 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-emerald-800">
                        {pack.packId}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{b?.drugName || 'Medicine Pack'}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Batch: {pack.batchNumber}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {pack.status}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 space-y-0.5">
                    <div>Serial: <strong className="font-mono text-slate-900">{pack.serialNumber}</strong></div>
                    <div>Custodian: <strong className="text-slate-900">{pack.currentHolder}</strong></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPackForModal(pack)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Inspect QR & Print</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete QR code for pack ${pack.packId}?`)) {
                          deletePack(pack.packId);
                        }
                      }}
                      title="Delete this generated QR code"
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shrink-0 shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: SHIPPING INVOICES */}
      {companyTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commercial Shipping Invoices</h3>
              <p className="text-xs text-slate-500">Track dispatched consignments to certified distributors and pharmacies</p>
            </div>

            <button
              onClick={() => {
                setInvoiceForm((prev) => ({
                  ...prev,
                  batchNumber: companyBatches[0]?.batchNumber || '',
                }));
                setIsCreatingInvoice(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Destination Facility</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Total Amount (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyInvoices.length > 0 ? (
                    companyInvoices.map((inv) => (
                      <tr key={inv.invoiceNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {inv.distributorName}
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
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="h-3 w-3 text-blue-700" />
                            <span>View Sheet</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No shipping invoices created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: COMPANY PROFILE & CDSCO LICENSES */}
      {companyTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Verified CDSCO Manufacturer Registration
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {activeCompany.name}
            </h2>
            <p className="text-xs text-slate-500">
              Regulatory compliance profile and active pharmaceutical manufacturing certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-700" />
                <span>Drug Manufacturing Licenses</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div>License Form: <strong className="text-slate-900">Form 25 & Form 28 (Finished Formulations)</strong></div>
                <div>License Number: <strong className="font-mono text-slate-900">{activeCompany.drugLicenseNo}</strong></div>
                <div>Jurisdiction: <strong className="text-slate-900">{activeCompany.stateJurisdiction}</strong></div>
                <div>Status: <span className="font-bold text-emerald-800 uppercase">{activeCompany.status}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-700" />
                <span>Facility & Tax Compliance</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div>GSTIN: <strong className="font-mono text-slate-900">{activeCompany.gstin}</strong></div>
                <div>Plant Address: <strong className="text-slate-900">{activeCompany.address}</strong></div>
                <div>Contact Email: <strong className="text-slate-900">{activeCompany.contactEmail}</strong></div>
                <div>GMP Certification: <strong className="text-emerald-800">WHO-GMP Compliant (Schedule M)</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch QR Matrix Modal */}
      {selectedBatchForQRs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Serialized QR Matrix: {selectedBatchForQRs.drugName} ({selectedBatchForQRs.batchNumber})
                </h3>
                <p className="text-xs text-slate-500">
                  Printable individual medicine QR stickers with cryptographic Merkle proof
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForQRs(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {loadingQRs ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Generating high-resolution cryptographic QR codes...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {generatedQRs.map(({ pack, qrDataUrl }) => (
                    <div
                      key={pack.packId}
                      className="rounded-xl border border-slate-200 p-3 text-center space-y-2 bg-slate-50/50"
                    >
                      <img
                        src={qrDataUrl}
                        alt={pack.packId}
                        className="mx-auto h-28 w-28 bg-white p-1 rounded-lg border border-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="font-mono text-[11px] font-bold text-slate-900">{pack.serialNumber}</div>
                        <div className="font-mono text-[10px] text-slate-500 truncate">{pack.packId}</div>
                      </div>
                      <button
                        onClick={() => setSelectedPackForModal(pack)}
                        className="w-full rounded bg-emerald-700 py-1 text-[10px] font-bold text-white hover:bg-emerald-800"
                      >
                        Print Sticker
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {generatedQRs.length} total packs in matrix
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Entire QR Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Medicine Pack QR Modal */}
      {selectedPackForModal && (
        <MedicineQRCodeModal
          pack={selectedPackForModal}
          batch={batches.find((b) => b.batchNumber === selectedPackForModal.batchNumber)}
          onClose={() => setSelectedPackForModal(null)}
          onDeletePack={(packId) => deletePack(packId)}
        />
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Batch: {editingBatch.batchNumber}
              </h3>
              <button onClick={() => setEditingBatch(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Drug Name</label>
                <input
                  type="text"
                  value={editingBatch.drugName}
                  onChange={(e) =>
                    setEditingBatch({ ...editingBatch, drugName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage Form</label>
                <input
                  type="text"
                  value={editingBatch.dosageForm}
                  onChange={(e) =>
                    setEditingBatch({ ...editingBatch, dosageForm: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="rounded-lg border px-3 py-1.5 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 font-bold text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      {isCreatingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Issue Shipping Invoice</h3>
              <button onClick={() => setIsCreatingInvoice(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Batch</label>
                <select
                  value={invoiceForm.batchNumber}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, batchNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 font-mono"
                >
                  {companyBatches.map((b) => (
                    <option key={b.batchNumber} value={b.batchNumber}>
                      {b.batchNumber} - {b.drugName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Facility</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.distributorName}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, distributorName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={invoiceForm.packQuantity}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        packQuantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.unitPriceInr}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        unitPriceInr: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingInvoice(false)}
                  className="rounded-lg border px-3 py-1.5 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 font-bold text-white"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <ShippingInvoiceModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};

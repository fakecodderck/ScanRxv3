import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Store,
  Truck,
  AlertTriangle,
  FileText,
  Boxes,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Lock,
  ArrowRight,
  QrCode,
  Filter,
  Eye,
  Printer,
  Download,
  Sparkles,
  MapPin,
  Mail,
  Hash,
  Phone,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicineBatch, MedicinePack, RegisteredOrganization, SecurityAlert, ShippingInvoice } from '../types';
import { MedicineQRCodeModal } from './MedicineQRCodeModal';
import { ADMIN_EMAIL } from '../lib/firebase';

export const AdminPortal: React.FC = () => {
  const {
    batches,
    packs,
    securityAlerts,
    invoices,
    organizations,
    approveOrganization,
    rejectOrganization,
    requestMoreInfoOrganization,
    suspendOrganization,
    reactivateOrganization,
    recallBatch,
    resolveAlert,
    firebaseUser,
    setActiveView,
    verifyMedicineScan,
  } = useLedgerStore();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'directory' | 'qrcodes' | 'batches' | 'invoices' | 'security'>('directory');

  // Directory Filters
  const [entityTypeFilter, setEntityTypeFilter] = useState<'ALL' | 'manufacturer' | 'pharmacy' | 'distributor'>('ALL');
  const [orgStatusFilter, setOrgStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'MORE_INFORMATION_REQUIRED' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Entity for Detail Drawer/View
  const [selectedEntity, setSelectedEntity] = useState<RegisteredOrganization | null>(null);

  // Selected QR Code for Modal Inspection
  const [selectedPackForQR, setSelectedPackForQR] = useState<MedicinePack | null>(null);

  // QR Explorer Filter
  const [qrCompanyFilter, setQrCompanyFilter] = useState<string>('ALL');
  const [qrStatusFilter, setQrStatusFilter] = useState<string>('ALL');
  const [qrSearchQuery, setQrSearchQuery] = useState<string>('');

  const unresolvedAlerts = securityAlerts.filter((a) => !a.resolved);
  const companiesCount = organizations.filter((o) => o.type === 'manufacturer').length;
  const pharmaciesCount = organizations.filter((o) => o.type === 'pharmacy').length;
  const totalPacksCount = packs.length;

  // Filtered Organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesType = entityTypeFilter === 'ALL' || org.type === entityTypeFilter;
      const matchesStatus = orgStatusFilter === 'ALL' || org.status === orgStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        org.name.toLowerCase().includes(q) ||
        org.drugLicenseNo.toLowerCase().includes(q) ||
        org.gstin.toLowerCase().includes(q) ||
        org.stateJurisdiction.toLowerCase().includes(q) ||
        org.address.toLowerCase().includes(q) ||
        org.contactEmail.toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [organizations, entityTypeFilter, orgStatusFilter, searchQuery]);

  // Filtered QR Packs
  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      const batch = batches.find((b) => b.batchNumber === pack.batchNumber);
      const matchesCompany =
        qrCompanyFilter === 'ALL' ||
        (batch && batch.manufacturer.toLowerCase().includes(qrCompanyFilter.toLowerCase()));
      const matchesStatus = qrStatusFilter === 'ALL' || pack.status === qrStatusFilter;

      const q = qrSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pack.packId.toLowerCase().includes(q) ||
        pack.serialNumber.toLowerCase().includes(q) ||
        pack.batchNumber.toLowerCase().includes(q) ||
        pack.currentHolder.toLowerCase().includes(q) ||
        (batch && (batch.drugName.toLowerCase().includes(q) || batch.genericName.toLowerCase().includes(q)));

      return matchesCompany && matchesStatus && matchesSearch;
    });
  }, [packs, batches, qrCompanyFilter, qrStatusFilter, qrSearchQuery]);

  // Packs belonging to selected company or pharmacy
  const entityPacks = useMemo(() => {
    if (!selectedEntity) return [];

    if (selectedEntity.type === 'manufacturer') {
      // Find batches made by this company
      const companyBatches = batches
        .filter((b) => b.manufacturer.toLowerCase().includes(selectedEntity.name.toLowerCase()))
        .map((b) => b.batchNumber);

      return packs.filter((p) => companyBatches.includes(p.batchNumber));
    }

    if (selectedEntity.type === 'pharmacy') {
      // Find packs held by or dispensed from this pharmacy
      return packs.filter(
        (p) =>
          p.currentHolder.toLowerCase().includes(selectedEntity.name.toLowerCase()) ||
          p.custodyHistory.some((c) => c.toActor.toLowerCase().includes(selectedEntity.name.toLowerCase()))
      );
    }

    // Default: packs related to this organization
    return packs.filter(
      (p) =>
        p.currentHolder.toLowerCase().includes(selectedEntity.name.toLowerCase()) ||
        p.custodyHistory.some((c) => c.toActor.toLowerCase().includes(selectedEntity.name.toLowerCase()))
    );
  }, [selectedEntity, packs, batches]);

  // Batches belonging to selected company
  const entityBatches = useMemo(() => {
    if (!selectedEntity) return [];
    return batches.filter((b) =>
      b.manufacturer.toLowerCase().includes(selectedEntity.name.toLowerCase())
    );
  }, [selectedEntity, batches]);

  // Selected pack's batch
  const selectedPackBatch = useMemo(() => {
    if (!selectedPackForQR) return undefined;
    return batches.find((b) => b.batchNumber === selectedPackForQR.batchNumber);
  }, [selectedPackForQR, batches]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Admin Identity & Authority Banner */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <span>Central Drug Administration & Vigilance Control</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-800 font-bold">Admin Verified Node</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                National Pharmaceutical Regulatory Authority Console
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                <span>Logged in as Admin:</span>
                <span className="font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                  {firebaseUser?.email || ADMIN_EMAIL}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Jurisdiction: Central Drugs Standard Control Organisation (CDSCO), New Delhi</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-center shadow-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Companies</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{companiesCount}</div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-center shadow-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pharmacies</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{pharmaciesCount}</div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-center shadow-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total QRs</div>
              <div className="text-lg font-bold text-emerald-800 font-mono tabular-nums">{totalPacksCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Bar adhering to Unslop Design */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => {
              setActiveTab('directory');
              setSelectedEntity(null);
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
              activeTab === 'directory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Registered Companies & Pharmacies</span>
            <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-white">
              {organizations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
              activeTab === 'qrcodes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>All Medicine QR Codes Explorer</span>
            <span className="rounded-full bg-emerald-800 px-1.5 py-0.2 text-[10px] font-mono text-white">
              {packs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
              activeTab === 'batches'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Boxes className="h-4 w-4" />
            <span>Batches Ledger</span>
            <span className="text-[10px] font-mono text-slate-400">({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
              activeTab === 'invoices'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Invoices</span>
            <span className="text-[10px] font-mono text-slate-400">({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
              activeTab === 'security'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Impossible Travel Radar</span>
            {unresolvedAlerts.length > 0 && (
              <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-mono text-white font-bold">
                {unresolvedAlerts.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Drugs and Cosmetics Act 1940 & Rules 1945
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTERED COMPANIES & PHARMACIES DIRECTORY                         */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && !selectedEntity && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Live Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] uppercase mr-1">Filter Entity:</span>
              <button
                onClick={() => setEntityTypeFilter('ALL')}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  entityTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Entities ({organizations.length})
              </button>

              <button
                onClick={() => setEntityTypeFilter('manufacturer')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  entityTypeFilter === 'manufacturer'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Companies / Manufacturers ({companiesCount})</span>
              </button>

              <button
                onClick={() => setEntityTypeFilter('pharmacy')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  entityTypeFilter === 'pharmacy'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Pharmacies / Chemists ({pharmaciesCount})</span>
              </button>

              <button
                onClick={() => setEntityTypeFilter('distributor')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  entityTypeFilter === 'distributor'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Distributors & Stockists</span>
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, pharmacy, lic, GSTIN..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrganizations.map((org) => {
              const isCompany = org.type === 'manufacturer';
              const isPharmacy = org.type === 'pharmacy';
              const isApproved = org.status === 'APPROVED';

              // Calculate packs and batches linked to this entity
              const entityBatchesCount = batches.filter((b) =>
                b.manufacturer.toLowerCase().includes(org.name.toLowerCase())
              ).length;

              const entityPacksCount = isCompany
                ? packs.filter((p) => {
                    const b = batches.find((batch) => batch.batchNumber === p.batchNumber);
                    return b && b.manufacturer.toLowerCase().includes(org.name.toLowerCase());
                  }).length
                : packs.filter(
                    (p) =>
                      p.currentHolder.toLowerCase().includes(org.name.toLowerCase()) ||
                      p.custodyHistory.some((c) => c.toActor.toLowerCase().includes(org.name.toLowerCase()))
                  ).length;

              return (
                <div
                  key={org.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Entity Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                          isCompany
                            ? 'bg-emerald-700'
                            : isPharmacy
                            ? 'bg-purple-700'
                            : 'bg-blue-700'
                        }`}
                      >
                        {isCompany ? (
                          <Building2 className="h-5 w-5" />
                        ) : isPharmacy ? (
                          <Store className="h-5 w-5" />
                        ) : (
                          <Truck className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{org.name}</h3>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span
                            className={`font-semibold uppercase ${
                              isCompany
                                ? 'text-emerald-800'
                                : isPharmacy
                                ? 'text-purple-800'
                                : 'text-blue-800'
                            }`}
                          >
                            {isCompany
                              ? 'Pharmaceutical Company (Manufacturer)'
                              : isPharmacy
                              ? 'Licensed Retail Pharmacy & Chemist'
                              : 'Distributor Logistics Terminal'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold uppercase text-[10px] ${
                              isApproved ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {org.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEntity(org)}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Regulatory & License Details */}
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">
                          {isCompany ? 'Manufacturing Drug License' : 'Retail Chemist Drug License'}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{org.drugLicenseNo}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">
                          GSTIN Registration (India)
                        </span>
                        <span className="font-mono font-bold text-slate-900">{org.gstin}</span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">
                          State Drug Regulatory Jurisdiction
                        </span>
                        <span className="font-medium text-slate-800">{org.stateJurisdiction}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{org.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{org.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Batch Statistics with Inspection Action */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-4 text-xs font-mono">
                      {isCompany && (
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans uppercase">Batches</span>
                          <span className="font-bold text-slate-900">{entityBatchesCount} batches</span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans uppercase">
                          {isCompany ? 'Generated QRs' : 'Inventory QRs'}
                        </span>
                        <span className="font-bold text-emerald-800 font-mono">
                          {entityPacksCount} serialized QR(s)
                        </span>
                      </div>
                    </div>

                    {/* QR Inspection Trigger */}
                    <button
                      onClick={() => setSelectedEntity(org)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>
                        {isCompany ? 'Inspect Company QR Codes' : 'Inspect Pharmacy QRs'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              No organizations found matching your search or filters.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL DOSSIER VIEW: When Admin Clicks on a Company or Pharmacy            */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && selectedEntity && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedEntity(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span>← Back to All Companies & Pharmacies Directory</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">Entity ID: {selectedEntity.id}</span>
          </div>

          {/* Entity Profile Dossier Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs ${
                    selectedEntity.type === 'manufacturer'
                      ? 'bg-emerald-700'
                      : selectedEntity.type === 'pharmacy'
                      ? 'bg-purple-700'
                      : 'bg-blue-700'
                  }`}
                >
                  {selectedEntity.type === 'manufacturer' ? (
                    <Building2 className="h-6 w-6" />
                  ) : selectedEntity.type === 'pharmacy' ? (
                    <Store className="h-6 w-6" />
                  ) : (
                    <Truck className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedEntity.name}</h2>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        selectedEntity.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedEntity.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedEntity.type === 'manufacturer'
                      ? 'Pharmaceutical Manufacturing Corporation (CDSCO Licensed Form 25/28)'
                      : selectedEntity.type === 'pharmacy'
                      ? 'Licensed Retail Chemist & Dispensation Node (Form 20/21)'
                      : 'Distributor Logistics Hub'}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedEntity.status === 'PENDING_REVIEW' && (
                  <button
                    onClick={() => {
                      const notes = prompt('Enter CDSCO compliance verification notes:', 'Form 20/21 credentials verified.');
                      if (notes !== null) approveOrganization(selectedEntity.id, notes);
                    }}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
                  >
                    Approve Organization
                  </button>
                )}

                {selectedEntity.status === 'APPROVED' && (
                  <button
                    onClick={() => {
                      const notes = prompt('Enter statutory suspension grounds:');
                      if (notes) suspendOrganization(selectedEntity.id, notes);
                    }}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Suspend License
                  </button>
                )}

                {selectedEntity.status === 'SUSPENDED' && (
                  <button
                    onClick={() => reactivateOrganization(selectedEntity.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>

            {/* Dossier Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-sans">Drug License No.</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {selectedEntity.drugLicenseNo}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase font-sans">GSTIN (India)</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {selectedEntity.gstin}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase font-sans">Contact Email</span>
                <span className="font-mono text-slate-800 block mt-0.5">
                  {selectedEntity.contactEmail}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase font-sans">Jurisdiction</span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {selectedEntity.stateJurisdiction}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-4">
                <span className="text-[11px] text-slate-400 uppercase font-sans">Registered Facility Address</span>
                <span className="text-slate-800 block mt-0.5">{selectedEntity.address}</span>
              </div>
            </div>
          </div>

          {/* Batches Produced (if Company) */}
          {selectedEntity.type === 'manufacturer' && entityBatches.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-emerald-700" />
                  <span>Medicine Batches Manufactured by {selectedEntity.name}</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">{entityBatches.length} batch(es)</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {entityBatches.map((batch) => (
                  <div key={batch.batchNumber} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{batch.drugName}</div>
                      <div className="text-[11px] text-slate-500">
                        {batch.genericName} · Batch: <span className="font-mono font-semibold">{batch.batchNumber}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      <div>Mfg: {batch.mfgDate} · Exp: {batch.expiryDate}</div>
                      {batch.mrpInr ? <div className="text-emerald-800 font-bold">₹{batch.mrpInr.toFixed(2)} MRP</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Serialized QR Codes List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="h-4.5 w-4.5 text-emerald-700" />
                  <span>
                    {selectedEntity.type === 'manufacturer'
                      ? `Serialized Medicine QR Codes Generated by ${selectedEntity.name}`
                      : `Medicine Pack QR Codes in Custody of ${selectedEntity.name}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Each medicine pack has its own unique cryptographically signed QR code auto-generated on the CDSCO ledger.
                </p>
              </div>

              <div className="text-xs font-mono text-emerald-800 font-bold">
                {entityPacks.length} Serialized Pack(s)
              </div>
            </div>

            {/* QR Codes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {entityPacks.map((pack) => {
                const batch = batches.find((b) => b.batchNumber === pack.batchNumber);

                return (
                  <div
                    key={pack.packId}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-slate-900">{pack.packId}</div>
                        <div className="text-[11px] font-bold text-emerald-900 mt-0.5">
                          {batch?.drugName || pack.batchNumber}
                        </div>
                      </div>

                      <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                        {pack.serialNumber}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {batch?.genericName || 'Active Formulation IP'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200/60 pt-2">
                      <span>Status: {pack.status.replace('_', ' ')}</span>
                      <span>Exp: {batch?.expiryDate || pack.expiryDate}</span>
                    </div>

                    {/* View QR Code Button */}
                    <button
                      onClick={() => setSelectedPackForQR(pack)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Inspect & Print QR Code</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {entityPacks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                No medicine pack QR codes recorded for this entity yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL MEDICINE QR CODES MASTER EXPLORER                               */}
      {/* ========================================================================= */}
      {activeTab === 'qrcodes' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-700" />
                  <span>National Medicine QR Code Ledger Explorer</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Inspect every auto-generated serialized medicine QR code minted across all Indian pharmaceutical companies.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={qrCompanyFilter}
                  onChange={(e) => setQrCompanyFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Manufacturing Companies</option>
                  <option value="Sun Pharma">Sun Pharma Laboratories</option>
                  <option value="Micro Labs">Micro Labs Limited</option>
                  <option value="Alkem">Alkem Laboratories</option>
                </select>

                <select
                  value={qrStatusFilter}
                  onChange={(e) => setQrStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Pack Statuses</option>
                  <option value="at_pharmacy">At Pharmacy</option>
                  <option value="dispensed">Dispensed to Patient</option>
                  <option value="in_transit">In Transit</option>
                  <option value="quarantined">Quarantined / Recalled</option>
                </select>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={qrSearchQuery}
                    onChange={(e) => setQrSearchQuery(e.target.value)}
                    placeholder="Search Pack ID, Serial, Drug..."
                    className="w-48 sm:w-60 rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* QR Packs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPacks.map((pack) => {
              const batch = batches.find((b) => b.batchNumber === pack.batchNumber);

              return (
                <div
                  key={pack.packId}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-600 transition-all space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-slate-900">{pack.packId}</div>
                      <div className="font-bold text-emerald-900 text-xs mt-0.5">
                        {batch?.drugName || pack.batchNumber}
                      </div>
                    </div>

                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 border border-slate-200">
                      {pack.serialNumber}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {batch?.genericName || 'Active Formulation IP'}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <div>
                      <span className="text-slate-400">Batch:</span>{' '}
                      <span className="font-mono font-semibold text-slate-800">{pack.batchNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Company:</span>{' '}
                      <span className="font-semibold text-slate-800">{batch?.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-400">Holder:</span>{' '}
                      <span className="text-slate-700">{pack.currentHolder}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-500">
                      <span>{batch?.mrpInr ? `MRP: ₹${batch.mrpInr.toFixed(2)}` : 'Serialized Pack'}</span>
                      <span className="capitalize text-emerald-800 font-semibold">{pack.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPackForQR(pack)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>View & Print QR Code</span>
                  </button>
                </div>
              );
            })}
          </div>

          {filteredPacks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              No QR codes found matching the filter criteria.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BATCHES LEDGER                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'batches' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Medicine Batches (CDSCO Merkle Roots)</h2>
              <p className="text-xs text-slate-500">Active manufacturing licenses and cryptographic roots.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{batches.length} batch(es)</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {batches.map((batch) => (
              <div key={batch.batchNumber} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{batch.drugName}</span>
                      <span className="font-mono text-slate-500 font-semibold">({batch.batchNumber})</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          batch.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {batch.genericName} · MFR: <strong>{batch.manufacturer}</strong> · Lic: {batch.mfgLicenseNo}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {batch.status === 'active' ? (
                      <button
                        onClick={() => {
                          const reason = prompt('Specify statutory recall grounds (e.g. Sub-standard assay):');
                          if (reason) recallBatch(batch.batchNumber, reason);
                        }}
                        className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Recall Batch (Sec 26A)
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700">Recalled under CDSCO order</span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-600 break-all select-all">
                  <span className="text-slate-400 font-sans uppercase text-[10px] block">Merkle Root:</span>
                  {batch.merkleRoot}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHIPPING INVOICES                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">National Pharmaceutical Shipping Invoices</h2>
              <p className="text-xs text-slate-500">Tax invoices dispatched between companies and distributors.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{invoices.length} invoice(s)</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                  <div className="text-[11px] text-slate-600">
                    From <strong>{inv.companyName}</strong> to <strong>{inv.distributorName}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {inv.drugName} (Batch: {inv.batchNumber}) · {inv.packQuantity.toLocaleString()} packs
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">
                    ₹{inv.grandTotalInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="capitalize text-[11px] font-semibold text-emerald-700">
                    {inv.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY ANOMALIES & RADAR                                         */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <span>Impossible Travel Anomaly Radar & Critical Clones</span>
              </h2>
              <p className="text-xs text-rose-800">
                Real-time security alerts triggered when identical pack QRs appear at speeds &gt; 850 km/h.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-900 font-bold">
              {unresolvedAlerts.length} Active Alert(s)
            </span>
          </div>

          <div className="space-y-3">
            {securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-rose-900">{alert.drugName} ({alert.batchNumber})</div>
                  <span
                    className={`font-semibold uppercase text-[10px] ${
                      alert.resolved ? 'text-slate-400' : 'text-rose-700'
                    }`}
                  >
                    {alert.resolved ? 'RESOLVED' : 'ACTIVE THREAT'}
                  </span>
                </div>

                <p className="text-slate-700 text-[11px]">{alert.details}</p>

                {alert.calculatedVelocityKmH && (
                  <div className="font-mono text-rose-700 font-bold">
                    Velocity: {alert.calculatedVelocityKmH.toLocaleString()} km/h
                  </div>
                )}

                {!alert.resolved && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        const note = prompt('Enter investigation resolution note:');
                        if (note) resolveAlert(alert.id, note);
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dedicated Interactive QR Code Modal */}
      {selectedPackForQR && (
        <MedicineQRCodeModal
          pack={selectedPackForQR}
          batch={selectedPackBatch}
          companyName={selectedPackBatch?.manufacturer}
          pharmacyHolder={selectedPackForQR.currentHolder}
          onClose={() => setSelectedPackForQR(null)}
          onVerifyInScanner={(token) => {
            setActiveView('public_scan');
          }}
        />
      )}
    </div>
  );
};

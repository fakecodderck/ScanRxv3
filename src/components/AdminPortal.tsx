import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Truck,
  Store,
  AlertTriangle,
  FileText,
  Boxes,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { MedicineBatch, SecurityAlert, ShippingInvoice } from '../types';

export const AdminPortal: React.FC = () => {
  const {
    batches,
    packs,
    securityAlerts,
    invoices,
    recallBatch,
    resolveAlert,
    firebaseUser,
  } = useLedgerStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'batches' | 'invoices'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const unresolvedAlerts = securityAlerts.filter((a) => !a.resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            <span>National Drug Administration & Vigilance Control (Me / Admin)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Central Administrative Console & Ecosystem Oversight
          </h1>
          <p className="text-xs text-slate-500">
            Logged in as Admin ({firebaseUser?.email || 'Super Administrator'}). Manage registered companies, batches, shipping invoices, and national recall directives.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Alerts ({unresolvedAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'companies'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registered Nodes
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'batches'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shipping Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Registered Batches
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {batches.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Sun Pharma, Micro Labs, Alkem</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Serialized Strips
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-1 font-mono tabular-nums">
                {packs.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">CDSCO cryptographic QR tokens</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Shipping Invoices
              </div>
              <div className="text-2xl font-extrabold text-blue-800 mt-1 font-mono tabular-nums">
                {invoices.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">GST Tax Invoices Issued</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Active Security Breaches
              </div>
              <div className="text-2xl font-extrabold text-rose-700 mt-1 font-mono tabular-nums">
                {unresolvedAlerts.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Impossible velocity flags</div>
            </div>
          </div>

          {/* Critical Alerts Stream */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                National Security & Counterfeit Breach Log
              </h2>
              <span className="text-xs text-rose-700 font-semibold font-mono">
                {unresolvedAlerts.length} Unresolved Incidents
              </span>
            </div>

            {securityAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No security alerts logged. The pharmaceutical supply chain is nominal.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 font-mono">{alert.drugName}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                          {alert.alertType.replace('_', ' ')}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-[11px] font-mono text-slate-500">Lot {alert.batchNumber}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{alert.details}</p>
                    </div>

                    <div className="text-right">
                      {!alert.resolved ? (
                        <button
                          onClick={() => {
                            const note = prompt('Enter admin quarantine directive notes:');
                            if (note) resolveAlert(alert.id, note);
                          }}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-800 transition-colors"
                        >
                          Resolve & Quarantine
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800">Resolved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Companies & Registered Nodes Tab */}
      {activeTab === 'companies' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Approved Ecosystem Participants
            </h2>
            <span className="text-xs text-slate-500">Audited by National Drug Authority</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                  SP
                </div>
                <div>
                  <div className="font-bold text-slate-900">Sun Pharma Laboratories Ltd.</div>
                  <div className="text-slate-500 text-[11px]">Baddi Plant II, Solan District, Himachal Pradesh · Role: Manufacturer / Company</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800">
                Verified Manufacturer
              </span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                  CX
                </div>
                <div>
                  <div className="font-bold text-slate-900">Coldex National Logistics Hub</div>
                  <div className="text-slate-500 text-[11px]">Bhiwandi Central Pharma Freight Hub, Maharashtra · Role: Distributor</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-800">
                Verified Distributor
              </span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                  AP
                </div>
                <div>
                  <div className="font-bold text-slate-900">Apollo Pharmacy #402</div>
                  <div className="text-slate-500 text-[11px]">Indiranagar, Bengaluru, Karnataka · Role: Pharmacy / Retail Chemist</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-800">
                Verified Chemist
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Registered Batches</h2>
            <span className="text-xs text-slate-500 font-mono">{batches.length} Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="p-3">Batch Number</th>
                  <th className="p-3">Drug Name</th>
                  <th className="p-3">Manufacturer</th>
                  <th className="p-3">MRP (₹)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr key={batch.batchNumber} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{batch.batchNumber}</td>
                    <td className="p-3 font-semibold">{batch.drugName}</td>
                    <td className="p-3 text-slate-600">{batch.manufacturer}</td>
                    <td className="p-3 font-mono text-emerald-800 font-bold">₹{batch.mrpInr?.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          batch.status === 'active'
                            ? 'text-emerald-800'
                            : 'text-rose-700'
                        }`}
                      >
                        {batch.status === 'active' ? 'Active' : 'CDSCO Recalled'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {batch.status === 'active' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Specify statutory CDSCO recall order:');
                            if (reason) recallBatch(batch.batchNumber, reason);
                          }}
                          className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Execute Recall
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Commercial Shipping Invoices</h2>
            <span className="text-xs text-slate-500 font-mono">{invoices.length} Registered</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {inv.companyName} $\rightarrow$ {inv.distributorName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Product: {inv.drugName} (Qty: {inv.packQuantity}) · Lot: {inv.batchNumber}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-emerald-800">₹{inv.grandTotalInr.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{inv.dispatchDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Camera,
  Truck,
  Store,
  ExternalLink,
  ChevronRight,
  BookOpen,
  QrCode,
  Lock,
  Cpu,
  Search,
  Check,
  ArrowRight
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';

export const GuideViewer: React.FC = () => {
  const { setActiveView, switchUserRole } = useLedgerStore();
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const acceptanceCriteria = [
    {
      id: 'ac-1',
      title: 'Unregistered or malformed QR fails verification',
      rule: 'Section 5.3 & 7.3: Invalid/tampered token format triggers INVALID state immediately.',
      testAction: 'public_scan',
      implemented: true,
    },
    {
      id: 'ac-2',
      title: 'Modified token or invalid cryptographic signature fails',
      rule: 'Section 5.4: Digital signatures verified against Merkle leaf proofs; mismatch rejects.',
      testAction: 'public_scan',
      implemented: true,
    },
    {
      id: 'ac-3',
      title: 'Valid pack QR verified against manufacturer & batch',
      rule: 'Section 5.2: Pack serial ties directly to batch formulation, license, and CDSCO root.',
      testAction: 'public_scan',
      implemented: true,
    },
    {
      id: 'ac-4',
      title: 'Batch QR cannot substitute for an individual pack QR',
      rule: 'Section 2 & 5.3: Separate batch QR vs. serialized individual blister strip unit tokens.',
      testAction: 'manufacturer',
      implemented: true,
    },
    {
      id: 'ac-5',
      title: 'Pharmacy scans are recorded but excluded from public duplicate alerts',
      rule: 'Section 8 & 9.1: Authenticated pharmacy dispensing logged in audit trail without skewing citizen alerts.',
      testAction: 'pharmacy',
      implemented: true,
    },
    {
      id: 'ac-6',
      title: 'Repeated public scans compared intelligently by time and location',
      rule: 'Section 9.1: Evaluates time and distance; repeat scans nearby yield ALREADY_SCANNED rather than false accusations.',
      testAction: 'public_scan',
      implemented: true,
    },
    {
      id: 'ac-7',
      title: 'Suspicious location/time pattern triggers explainable alert',
      rule: 'Section 9.2: Haversine distance / elapsed time evaluates physical velocity (>850 km/h triggers SUSPICIOUS).',
      testAction: 'security_center',
      implemented: true,
    },
    {
      id: 'ac-8',
      title: 'Admin organization approval & suspension workflow',
      rule: 'Section 4: Only APPROVED organizations can mint batches or confirm custody shipments.',
      testAction: 'admin',
      implemented: true,
    },
    {
      id: 'ac-9',
      title: 'Lightweight shipment invoice with QR receipt confirmation',
      rule: 'Section 10.1: Invoice has its own QR; recipient confirms delivery with temperature logging.',
      testAction: 'distributor',
      implemented: true,
    },
    {
      id: 'ac-10',
      title: 'Optical physical-pack authentication distinction',
      rule: 'Section 6 & 7: Dual-phase verification distinguishes QR registration from physical PUF/pattern authentication.',
      testAction: 'public_scan',
      implemented: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <BookOpen className="h-4 w-4 text-emerald-700" />
            <span>Product & Development Specification</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            AushadhLedger Implementation Guide & Architecture
          </h1>
          <p className="text-xs text-slate-500">
            Authoritative product blueprint based on <code className="font-mono text-emerald-800">public/assets/aistudio/guide_dc1ca409.md</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('public_scan')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Open Live Verifier</span>
          </button>
        </div>
      </div>

      {/* Acceptance Criteria Live Compliance Matrix (Section 14) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Section 14 — Acceptance Criteria & Demonstrated Behaviors</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Production Acceptance Checklist
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 font-mono">
            {acceptanceCriteria.filter((c) => c.implemented).length} / {acceptanceCriteria.length} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {acceptanceCriteria.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:bg-slate-50 transition-colors space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-slate-900 flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{item.title}</span>
                </div>
                <button
                  onClick={() => setActiveView(item.testAction as any)}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline shrink-0"
                >
                  Test $\rightarrow$
                </button>
              </div>
              <p className="text-[11px] text-slate-600 pl-6">{item.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Guide Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2 text-xs sticky top-20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-100">
            Guide Sections
          </div>

          <button
            onClick={() => setActiveSection('all')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'all'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Sections Summary
          </button>

          <button
            onClick={() => setActiveSection('s3_roles')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 's3_roles'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            §3. User Roles & Org Types
          </button>

          <button
            onClick={() => setActiveSection('s4_approval')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 's4_approval'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            §4. Org Registration & Approval
          </button>

          <button
            onClick={() => setActiveSection('s6_optical')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 's6_optical'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            §6 & 7. Optical Physical-Pack Authentication
          </button>

          <button
            onClick={() => setActiveSection('s9_duplicate')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 's9_duplicate'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            §8 & 9. Scan Intelligence & Velocity
          </button>

          <button
            onClick={() => setActiveSection('s10_shipment')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 's10_shipment'
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            §10. Lightweight Shipment & Receipt QR
          </button>
        </div>

        {/* Detailed Section Content */}
        <div className="lg:col-span-8 space-y-6 text-xs text-slate-700">
          {/* Section: Roles & Organization Types */}
          {(activeSection === 'all' || activeSection === 's3_roles') && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-emerald-700" />
                  <span>3. User Roles and Organization Types</span>
                </h3>
                <span className="text-slate-400 font-mono">Guide Section 3</span>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p>
                  AushadhLedger explicitly partitions operational authority between the platform owner and certified pharmaceutical supply chain nodes:
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 font-semibold">3.1 Main Platform Administrator (Me):</strong> Central platform governance. Reviews, approves, rejects, suspends, or reactivates organizations; views all products, batches, packs, and shipping logs; executes CDSCO statutory recall directives (Section 26A); resolves security incidents.
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 font-semibold">3.2 Manufacturer:</strong> Registers formulations (Indian Pharmacopoeia IP), creates batches, mints separate batch QRs and serialized blister strip unit tokens, enrolls optical security-pattern references, and generates GST shipping invoices.
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 font-semibold">3.3 C&F / Super Stockist & Distributor:</strong> Inbound consignment confirmation through shipment QR scan, cold-chain temperature verification, available stock visibility, and forward custody transfer to licensed retail pharmacies.
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 font-semibold">3.5 Pharmacy / Retail Chemist:</strong> Scans shipment QR to confirm stock arrival; dispenses to patients with token sealing. <em className="text-emerald-800 font-semibold not-italic">Pharmacy scans are retained in audit history but excluded from public duplicate-scan alerts.</em>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <strong className="text-slate-900 font-semibold">3.6 Public Consumer:</strong> Frictionless, zero-login smartphone camera scanning open to all citizens.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Organization Registration & Approval */}
          {(activeSection === 'all' || activeSection === 's4_approval') && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-700" />
                  <span>4. Organization Registration and Approval Workflow</span>
                </h3>
                <span className="text-slate-400 font-mono">Guide Section 4</span>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p>
                  No organization is permitted to mint, transfer, or confirm stock without active verification by the platform administrator:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px] text-center">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                    PENDING_REVIEW
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
                    MORE_INFO_REQ
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                    APPROVED
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
                    REJECTED
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold">
                    SUSPENDED
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveView('admin')}
                    className="flex items-center gap-1.5 font-bold text-emerald-800 hover:underline"
                  >
                    <span>Manage Organization Applications in Admin Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Optical Physical-Pack Authentication */}
          {(activeSection === 'all' || activeSection === 's6_optical') && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-blue-700" />
                  <span>6 & 7. Optical Physical-Pack Authentication & Result States</span>
                </h3>
                <span className="text-slate-400 font-mono">Guide Section 6 & 7</span>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p>
                  A printed QR code alone is merely an identity that could theoretically be photocopied. To defeat photocopying threats without expensive NFC chips or scratch-offs, AushadhLedger defines a small machine-readable optical security pattern (microtexture / PUF printing / random fiber substrate) directly adjacent to the QR code.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900">Standardized Verification Result Taxonomy (§7.3):</div>
                  <ul className="space-y-1.5 text-[11px]">
                    <li><strong className="text-emerald-800">VERIFIED:</strong> Cryptographic token valid + optical physical pattern matched + zero travel anomaly.</li>
                    <li><strong className="text-blue-800">REGISTERED_BUT_NOT_FULLY_AUTHENTICATED:</strong> QR registered on CDSCO ledger, but optical physical-pattern check pending (guides consumer to Android Secure Scanner).</li>
                    <li><strong className="text-amber-800">ALREADY_SCANNED:</strong> Prior public scan recorded nearby; displays timestamp and prior location history (not an automatic counterfeit accusation).</li>
                    <li><strong className="text-rose-700">SUSPICIOUS:</strong> Risk signals detected (impossible physical velocity across distant cities, e.g. Chennai to Delhi in 11 mins).</li>
                    <li><strong className="text-rose-900">INVALID:</strong> Token or signature failed cryptographic SHA-256 Merkle root verification.</li>
                    <li><strong className="text-amber-900">BATCH_RECALLED:</strong> Batch recalled under Section 26A of Drugs and Cosmetics Act.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Scan Intelligence & Velocity */}
          {(activeSection === 'all' || activeSection === 's9_duplicate') && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-emerald-700" />
                  <span>8 & 9. Duplicate-Scan & Impossible Travel Intelligence</span>
                </h3>
                <span className="text-slate-400 font-mono">Guide Section 8 & 9</span>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p>
                  The engine evaluates time, distance, scan frequency, and actor categories:
                </p>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1 text-emerald-950">
                  <div className="font-bold">Agreed Rule:</div>
                  <p className="text-[11px]">
                    1. Pharmacy authenticated scans are stored in audit trails and strictly <strong>excluded</strong> from public duplicate alerts.<br />
                    2. Public scans are compared exclusively with prior public scans of the same pack ID.<br />
                    3. A repeat scan from the same device or within walking distance is classified as <strong>ALREADY_SCANNED</strong> with full scan history context, avoiding false consumer panic.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

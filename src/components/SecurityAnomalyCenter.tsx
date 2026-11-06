import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Clock,
  Gauge,
  CheckCircle,
  FileText,
  Boxes,
  Database,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { SecurityAlert, BlockchainBlock, ScanLog } from '../types';

export const SecurityAnomalyCenter: React.FC = () => {
  const { securityAlerts, scanLogs, blocks, resolveAlert, batches, packs } = useLedgerStore();

  const [activeTab, setActiveTab] = useState<'alerts' | 'map' | 'blockchain'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);

  const unresolvedAlerts = securityAlerts.filter((a) => !a.resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
            <ShieldAlert className="h-4 w-4" />
            <span>CDSCO & State Drug Inspectorate Vigilance Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Indian National Spurious Drug & Travel Velocity Radar
          </h1>
          <p className="text-xs text-slate-500">
            Real-time Haversine velocity auditing across Indian state transport corridors, packaging clone detection, and CDSCO ledger.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium shrink-0 overflow-x-auto max-w-full scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`rounded-md px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Spurious Alerts ({unresolvedAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`rounded-md px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
            <span>India Pharma Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('blockchain')}
            className={`rounded-md px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'blockchain'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-blue-600" />
            <span>CDSCO Blocks ({blocks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Incident Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {securityAlerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Spurious Drug Alerts</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No impossible travel velocities or cloned packaging tokens detected across Indian state drug monitoring stations.
                Click the Dolo 650 clone scenario in the Public Verifier to test a simulated counterfeit clone attack.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Alert Feed */}
              <div className="lg:col-span-7 space-y-3">
                {securityAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all text-xs ${
                      alert.resolved
                        ? 'border-slate-200 bg-slate-50/70 opacity-75'
                        : alert.alertType === 'impossible_travel'
                        ? 'border-rose-300 bg-rose-50/50 hover:border-rose-500 hover:shadow-xs'
                        : 'border-amber-300 bg-amber-50/50 hover:border-amber-500 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-2.5 w-2.5 rounded-full ${
                            alert.resolved
                              ? 'bg-slate-400'
                              : alert.alertType === 'impossible_travel'
                              ? 'bg-rose-600 animate-ping'
                              : 'bg-amber-600'
                          }`}
                        />
                        <span className="font-bold text-slate-900 font-mono">
                          {alert.alertType.toUpperCase().replace('_', ' ')}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wide ${
                            alert.severity === 'critical'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 mb-1">{alert.drugName}</div>
                    <p className="text-slate-600 leading-snug mb-3">{alert.details}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                      <span>Pack Serial: {alert.packId}</span>
                      {alert.calculatedVelocityKmH ? (
                        <span className="text-rose-700 font-bold">
                          Velocity: {alert.calculatedVelocityKmH.toLocaleString()} km/h
                        </span>
                      ) : null}
                      <span>{alert.resolved ? 'Resolved by Drug Inspector' : 'Action Required'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert Forensic Details Pane */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    State Drug Inspectorate Audit Dossier
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAlert ? 'Statutory forensic investigation log' : 'Select an alert on the left to inspect Indian transit physics'}
                  </p>
                </div>

                {selectedAlert ? (
                  <div className="space-y-4 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">CDSCO Case ID</span>
                        <span className="font-mono font-semibold">{selectedAlert.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Offence Type</span>
                        <span className="font-semibold text-rose-700">Section 17B (Spurious Drug)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Medicine Lot</span>
                        <span className="font-mono">{selectedAlert.batchNumber}</span>
                      </div>
                    </div>

                    {selectedAlert.locations && selectedAlert.locations.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-700">Geographic Scans in India</div>
                        <div className="space-y-2">
                          {selectedAlert.locations.map((loc, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-2.5 text-[11px]">
                              <div className="font-semibold text-slate-900">
                                Scan Point {i === 0 ? '1' : '2'}: {loc.name}
                              </div>
                              <div className="font-mono text-slate-500 mt-0.5">
                                {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E ·{' '}
                                {new Date(loc.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!selectedAlert.resolved ? (
                      <button
                        onClick={() => {
                          const note = prompt('Enter State Drug Controller seizure reference / notes:');
                          if (note) resolveAlert(selectedAlert.id, note);
                        }}
                        className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                      >
                        Issue Statutory Quarantine Order (Section 26A)
                      </button>
                    ) : (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                        <div className="font-bold">Investigation Concluded</div>
                        <p className="mt-0.5 text-[11px]">{selectedAlert.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Click an alert on the left to review physical speed calculations and GPS coordinates.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Geographic Radar Map (India Centered) */}
      {activeTab === 'map' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Indian Subcontinent Pharmaceutical Transit Radar</h2>
              <p className="text-xs text-slate-400">
                Visualizing spatial distance vectors between consecutive strip scans across Indian pharmaceutical corridors.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Licensed Pharma Node
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                Spurious Clone Velocity Alert
              </span>
            </div>
          </div>

          {/* SVG Map of India */}
          <div className="relative aspect-16/9 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
            <svg
              viewBox="0 0 800 650"
              className="h-full w-full max-h-[500px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="indiaArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
              </defs>

              {/* Geographic Grid Lines */}
              <line x1="0" y1="325" x2="800" y2="325" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="400" y1="0" x2="400" y2="650" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />

              {/* Stylized Silhouette of India */}
              <path
                d="M 380 40 
                   Q 440 60 480 120 
                   T 450 170 
                   T 550 200 
                   T 620 220 
                   T 700 240 
                   T 640 310 
                   T 520 300 
                   T 490 380 
                   T 460 480 
                   T 400 590 
                   T 380 620 
                   T 360 590 
                   T 320 480 
                   T 280 380 
                   T 230 350 
                   T 260 270 
                   T 290 220 
                   T 320 160 
                   T 340 90 
                   Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Impossible Travel Vector Arc (Chennai ~ (440, 500) to Delhi-NCR ~ (380, 180)) */}
              <path
                d="M 440 500 Q 320 320 380 180"
                fill="none"
                stroke="url(#indiaArcGrad)"
                strokeWidth="3.5"
                strokeDasharray="8 6"
                className="animate-[dash_15s_linear_infinite]"
              />

              {/* Arc Velocity Badge */}
              <g transform="translate(300, 330)">
                <rect x="-105" y="-14" width="210" height="28" rx="14" fill="#BE123C" />
                <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  2,180 km in 11 min (11,890 km/h)
                </text>
              </g>

              {/* Node 1: Delhi-NCR (AIIMS / CDSCO HQ) */}
              <circle cx="380" cy="180" r="7" fill="#F43F5E" />
              <circle cx="380" cy="180" r="18" fill="#F43F5E" opacity="0.3" className="animate-ping" />
              <text x="380" y="160" fill="#F1F5F9" fontSize="11" fontWeight="bold" textAnchor="middle">
                New Delhi / AIIMS (Active Scan)
              </text>

              {/* Node 2: Chennai (Apollo Anna Nagar) */}
              <circle cx="440" cy="500" r="7" fill="#F43F5E" />
              <circle cx="440" cy="500" r="18" fill="#F43F5E" opacity="0.3" className="animate-ping" />
              <text x="440" y="525" fill="#F1F5F9" fontSize="11" fontWeight="bold" textAnchor="middle">
                Chennai / Apollo (11 min ago)
              </text>

              {/* Node 3: Baddi Industrial Area, HP (Sun Pharma Plant) */}
              <circle cx="370" cy="120" r="5" fill="#10B981" />
              <text x="370" y="105" fill="#94A3B8" fontSize="10" textAnchor="middle">
                Baddi (HP) Mfg Plant
              </text>

              {/* Node 4: Bhiwandi / Mumbai Hub (Coldex Logistics) */}
              <circle cx="280" cy="360" r="5" fill="#10B981" />
              <text x="280" y="380" fill="#94A3B8" fontSize="10" textAnchor="middle">
                Bhiwandi (Mumbai) Hub
              </text>

              {/* Node 5: Bengaluru, Karnataka (Apollo Dispensary) */}
              <circle cx="390" cy="490" r="5" fill="#10B981" />
              <text x="390" y="475" fill="#94A3B8" fontSize="10" textAnchor="middle">
                Bengaluru Pharmacy
              </text>

              {/* Node 6: Hyderabad (Genome Valley) */}
              <circle cx="410" cy="400" r="4" fill="#64748B" />
              <text x="410" y="418" fill="#64748B" fontSize="9" textAnchor="middle">
                Hyderabad Hub
              </text>

              {/* Node 7: Ahmedabad / Vadodara */}
              <circle cx="270" cy="290" r="4" fill="#64748B" />
              <text x="270" y="275" fill="#64748B" fontSize="9" textAnchor="middle">
                Gujarat Pharma Belt
              </text>

              {/* Node 8: Kolkata */}
              <circle cx="580" cy="300" r="4" fill="#64748B" />
              <text x="580" y="290" fill="#64748B" fontSize="9" textAnchor="middle">
                Kolkata Depot
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* Tab 3: Blockchain Explorer */}
      {activeTab === 'blockchain' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              CDSCO National Blockchain Blocks ({blocks.length} Blocks)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Consensus: Cryptographic SHA-256 Merkle Chain (India)
            </span>
          </div>

          <div className="space-y-3">
            {blocks.map((block) => {
              const isExpanded = expandedBlockIndex === block.index;
              return (
                <div
                  key={block.index}
                  className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden text-xs"
                >
                  <div
                    onClick={() => setExpandedBlockIndex(isExpanded ? null : block.index)}
                    className="p-4 cursor-pointer hover:bg-slate-50 flex flex-wrap items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 font-mono font-bold text-emerald-800">
                        #{block.index}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 font-mono">
                          Hash: {block.hash.slice(0, 20)}...
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(block.timestamp).toLocaleString('en-IN')} · {block.transactions.length} Transactions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                      <span>Nonce: {block.nonce}</span>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 font-sans uppercase text-[10px]">Previous Block Hash:</span>
                        <div className="text-slate-700 break-all select-all">{block.previousHash}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-sans uppercase text-[10px]">Block Merkle Root:</span>
                        <div className="text-slate-700 break-all select-all">{block.merkleRoot}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-sans uppercase text-[10px]">Transactions ({block.transactions.length}):</span>
                        <div className="mt-1 space-y-2">
                          {block.transactions.map((tx, idx) => (
                            <div key={idx} className="rounded bg-white p-2.5 border border-slate-200">
                              <div className="font-semibold text-emerald-800 flex justify-between">
                                <span>{tx.type}</span>
                                <span className="text-slate-400">{tx.txId}</span>
                              </div>
                              <pre className="mt-1 text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(tx.payload, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

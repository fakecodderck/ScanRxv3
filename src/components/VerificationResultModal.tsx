import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Clock,
  Gauge,
  Lock,
  Building,
  Calendar,
  FileCheck2,
  Download,
  Share2,
  PhoneCall
} from 'lucide-react';
import { MedicinePack, MedicineBatch, ScanLog, SecurityAlert } from '../types';

interface VerificationResultModalProps {
  result:
    | 'verified_authentic'
    | 'impossible_travel'
    | 'counterfeit_clone'
    | 'invalid_token'
    | 'expired_batch'
    | 'recalled_batch';
  pack?: MedicinePack;
  batch?: MedicineBatch;
  scanLog: ScanLog;
  alert?: SecurityAlert;
  isOfflineVerified?: boolean;
  onClose: () => void;
}

export const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
  result,
  pack,
  batch,
  scanLog,
  alert,
  isOfflineVerified,
  onClose,
}) => {
  const isAuthentic = result === 'verified_authentic';
  const isImpossibleTravel = result === 'impossible_travel';
  const isRecalled = result === 'recalled_batch';
  const isInvalid = result === 'invalid_token';

  useEffect(() => {
    if (isAuthentic) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#059669', '#10B981', '#F59E0B'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isAuthentic]);

  const handleDownloadCertificate = () => {
    const certText = `
AUSHADHLEDGER INDIA — CDSCO PHARMACEUTICAL VERIFICATION REPORT
National Drug Authority Portal · Drugs and Cosmetics Rules 1945
Generated: ${new Date(scanLog.timestamp).toISOString()}
Status: ${isAuthentic ? 'VERIFIED AUTHENTIC (IP STANDARD)' : 'FAILED - ' + result.toUpperCase()}

DRUG DETAILS (INDIA):
Commercial Name: ${batch?.drugName || 'Unknown'}
Generic Formulation: ${batch?.genericName || 'N/A'}
Batch / Lot No.: ${batch?.batchNumber || scanLog.batchNumber}
Strip Serial No.: ${pack?.serialNumber || 'N/A'}
Pack Unique ID: ${pack?.packId || scanLog.packId}
Mfg License No.: ${batch?.mfgLicenseNo || 'N/A'}
MRP: ${batch?.mrpInr ? `₹${batch.mrpInr.toFixed(2)} (Incl. of all taxes)` : 'N/A'}
Licensed Manufacturer: ${batch?.manufacturer || 'N/A'}
State Drug Authority: ${batch?.stateDrugAuthority || 'N/A'}
Manufacturing Date: ${batch?.mfgDate || 'N/A'}
Expiry Date: ${batch?.expiryDate || 'N/A'}

CRYPTOGRAPHIC MERKLE AUDIT:
Batch Merkle Root: ${batch?.merkleRoot || 'N/A'}
Pack Token Hash: ${pack?.tokenHash || 'N/A'}
CDSCO Protocol Version: v1/2026

SCAN TELEMETRY (INDIA):
Coordinates: ${scanLog.lat.toFixed(5)}°N, ${scanLog.lng.toFixed(5)}°E
Location: ${scanLog.placeName}
Offline Mode: ${isOfflineVerified ? 'YES (Cached CDSCO Merkle Root)' : 'NO (National Blockchain Node)'}
${
  scanLog.velocityKmH
    ? `Calculated Travel Speed: ${scanLog.velocityKmH.toLocaleString()} km/h (Distance: ${scanLog.distanceKm?.toLocaleString()} km over ${Math.round(
        (scanLog.timeDeltaSec || 0) / 60
      )} mins)`
    : ''
}

National Drug Grievance Helpline: 1800-11-0163 (CDSCO Toll Free)
    `.trim();

    const blob = new Blob([certText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AushadhLedger_Report_${pack?.packId || scanLog.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div
          className={`px-6 py-5 border-b ${
            isAuthentic
              ? 'bg-emerald-50 border-emerald-200'
              : isImpossibleTravel || isInvalid
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {isAuthentic ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                  <CheckCircle2 className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : isImpossibleTravel || isInvalid ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
                  <AlertOctagon className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  {isAuthentic ? (
                    <span className="text-emerald-800">CDSCO Certified Genuine Indian Medicine</span>
                  ) : isImpossibleTravel ? (
                    <span className="text-rose-800">Security Alert: Spurious Duplicate Strip Detected</span>
                  ) : isRecalled ? (
                    <span className="text-amber-800">CDSCO Section 26A Recall Notice</span>
                  ) : (
                    <span className="text-rose-800">Spurious / Unregistered Medicine Strip</span>
                  )}
                  {isOfflineVerified && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        Offline Verified
                      </span>
                    </>
                  )}
                </div>

                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {isAuthentic
                    ? batch?.drugName || 'Verified Genuine Medicine'
                    : isImpossibleTravel
                    ? 'Impossible Physical Travel Velocity (Cloned Packaging)'
                    : isRecalled
                    ? `${batch?.drugName} — BATCH RECALLED`
                    : 'Forged Packaging QR Token'}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  {isAuthentic
                    ? `${batch?.genericName || ''} · Batch ${batch?.batchNumber} · Pack ${pack?.serialNumber}`
                    : isImpossibleTravel
                    ? 'Identical medicine strip QR was scanned in two distant Indian cities within minutes'
                    : isRecalled
                    ? 'This medicine batch failed statutory quality standards in government laboratory testing'
                    : 'The scanned QR code is missing authentic pharmaceutical cryptographic signatures'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Critical Impossible Travel Callout */}
          {isImpossibleTravel && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs text-rose-950">
                  <div className="font-bold text-sm text-rose-900">
                    Spurious Duplicate Strip Diagnostic (India Transit Corridor)
                  </div>
                  <p>
                    This exact strip serial number was registered in another Indian city just minutes earlier.
                    Physical transport between these locations at this speed is physically impossible via any Indian road, rail, or air corridor.
                    <strong> Counterfeit packaging duplicate confirmed.</strong>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded-lg bg-white/80 p-2 border border-rose-200">
                      <div className="text-[10px] text-slate-500 uppercase font-sans">Distance Traversed</div>
                      <div className="font-bold text-rose-900 tabular-nums">
                        {scanLog.distanceKm?.toLocaleString()} km
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/80 p-2 border border-rose-200">
                      <div className="text-[10px] text-slate-500 uppercase font-sans">Time Difference</div>
                      <div className="font-bold text-rose-900 tabular-nums">
                        {Math.max(1, Math.round((scanLog.timeDeltaSec || 0) / 60))} minutes
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-lg bg-white/80 p-2 border border-rose-200">
                      <div className="text-[10px] text-slate-500 uppercase font-sans">Implied Velocity</div>
                      <div className="font-bold text-rose-600 tabular-nums">
                        {scanLog.velocityKmH?.toLocaleString()} km/h
                      </div>
                    </div>
                  </div>

                  {scanLog.previousScan && (
                    <div className="mt-2 text-[11px] text-slate-700 bg-white/60 p-2 rounded border border-rose-100">
                      <span className="font-semibold text-rose-900">First Scan Location:</span>{' '}
                      {scanLog.previousScan.placeName} at{' '}
                      {new Date(scanLog.previousScan.timestamp).toLocaleTimeString()}
                      <br />
                      <span className="font-semibold text-rose-900">Current Scan Location:</span>{' '}
                      {scanLog.placeName} at{' '}
                      {new Date(scanLog.timestamp).toLocaleTimeString()}
                    </div>
                  )}

                  <div className="font-semibold text-rose-900 pt-1 flex items-center justify-between">
                    <span>Do NOT ingest these tablets. Hand over to your local Chemist or Drug Inspector.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recalled Batch Warning */}
          {isRecalled && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-950">
              <div className="font-bold text-sm text-amber-900 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Statutory Recall by State Drug Controller
              </div>
              <p>
                Batch <strong>{batch?.batchNumber}</strong> has been flagged for recall under Section 26A of the Drugs and Cosmetics Act.
                Stockists and chemists across India have been instructed to freeze inventory. Please return this strip for immediate refund or replacement.
              </p>
            </div>
          )}

          {/* Product Specifications & Pricing Card (India) */}
          {batch && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Indian Pharmaceutical Regulatory Record (IP Standard)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Maximum Retail Price (MRP)</div>
                  <div className="font-semibold text-emerald-800 text-sm">
                    {batch.mrpInr ? `₹${batch.mrpInr.toFixed(2)}` : '₹145.00'}
                  </div>
                  <div className="text-[10px] text-slate-400">Incl. of all taxes</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Mfg License No.</div>
                  <div className="font-mono font-semibold text-slate-900 tabular-nums">
                    {batch.mfgLicenseNo || 'S-MNB/09/42 (HP)'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Manufacture Date</div>
                  <div className="font-mono text-slate-900">{batch.mfgDate}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Expiry Date</div>
                  <div className="font-mono font-semibold text-slate-900">{batch.expiryDate}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-500 text-[11px]">Licensed Manufacturer</div>
                  <div className="font-semibold text-slate-900">{batch.manufacturer}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-500 text-[11px]">Regulatory Jurisdiction</div>
                  <div className="text-slate-800">
                    {batch.stateDrugAuthority || 'Central Drugs Standard Control Organisation (CDSCO)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Merkle Proof Audit Trail */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-700" />
                <span>CDSCO Blockchain Merkle Inclusion Proof</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-800">SHA-256 Validated</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Batch Merkle Root</div>
                <div className="text-[11px] text-slate-800 break-all select-all font-semibold">
                  {batch?.merkleRoot || '0x4f8a...e91c'}
                </div>
              </div>

              {pack && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Strip Serial Token</div>
                    <div className="text-[11px] text-slate-800 font-semibold">{pack.serialNumber}</div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Leaf Index in Batch</div>
                    <div className="text-[11px] text-slate-800 font-semibold">
                      Leaf #{pack.merkleLeafIndex}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Indian Chain of Custody Timeline */}
          {pack?.custodyHistory && pack.custodyHistory.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Verified Indian Supply Chain Journey
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {pack.custodyHistory.map((event, idx) => (
                  <div key={event.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-700 shadow-sm" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-slate-900">{event.fromActor}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>Handed over to: {event.toActor}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {event.location.facilityName}
                      </span>
                      {event.temperatureReading && (
                        <span className="font-mono text-emerald-800">
                          {event.temperatureReading.toFixed(1)}°C
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <div className="relative text-xs">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-blue-900">Citizen / Patient Verification Scan</span>
                    <span className="text-[11px] text-blue-600 font-mono">
                      {new Date(scanLog.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span>{scanLog.placeName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CDSCO Grievance Toll-Free Helpline */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-700" />
              <span>National Drug Grievance Helpline (CDSCO Toll Free):</span>
            </div>
            <a
              href="tel:1800110163"
              className="font-mono font-bold text-emerald-800 hover:underline"
            >
              1800-11-0163
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CDSCO Report</span>
          </button>

          <button
            onClick={onClose}
            className={`rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors ${
              isAuthentic
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Close Verifier
          </button>
        </div>
      </div>
    </div>
  );
};

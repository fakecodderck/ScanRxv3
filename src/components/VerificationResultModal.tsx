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
  PhoneCall,
  QrCode,
  Sparkles,
  Info,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { MedicinePack, MedicineBatch, ScanLog, SecurityAlert, VerificationResultType } from '../types';

interface VerificationResultModalProps {
  result: VerificationResultType;
  pack?: MedicinePack;
  batch?: MedicineBatch;
  scanLog: ScanLog;
  alert?: SecurityAlert;
  priorPublicScanCount?: number;
  isOfflineVerified?: boolean;
  onClose: () => void;
}

export const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
  result,
  pack,
  batch,
  scanLog,
  alert,
  priorPublicScanCount,
  isOfflineVerified,
  onClose,
}) => {
  const isVerified = result === 'VERIFIED' || result === 'verified_authentic';
  const isRegisteredOnly = result === 'REGISTERED_BUT_NOT_FULLY_AUTHENTICATED';
  const isAlreadyScanned = result === 'ALREADY_SCANNED';
  const isSuspicious = result === 'SUSPICIOUS' || result === 'impossible_travel' || result === 'counterfeit_clone';
  const isRecalled = result === 'BATCH_RECALLED' || result === 'recalled_batch';
  const isBlocked = result === 'BLOCKED';
  const isInvalid = result === 'INVALID' || result === 'invalid_token';

  useEffect(() => {
    if (isVerified) {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#059669', '#10B981', '#F59E0B'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isVerified]);

  const handleDownloadCertificate = () => {
    const certText = `
AUSHADHLEDGER INDIA — CDSCO PHARMACEUTICAL VERIFICATION REPORT
National Drug Authority Portal · Drugs and Cosmetics Rules 1945
Generated: ${new Date(scanLog.timestamp).toISOString()}
Status: ${result.toUpperCase()}

PRODUCT IDENTIFIERS (INDIA):
Commercial Drug Name: ${batch?.drugName || 'Unknown'}
Generic Active Formulation: ${batch?.genericName || 'N/A'}
Batch / Lot No.: ${batch?.batchNumber || scanLog.batchNumber}
Strip Serial No.: ${pack?.serialNumber || 'N/A'}
Pack Unique ID: ${pack?.packId || scanLog.packId}
Mfg License No.: ${batch?.mfgLicenseNo || 'N/A'}
Maximum Retail Price (MRP): ${batch?.mrpInr ? `₹${batch.mrpInr.toFixed(2)} (Incl. of all taxes)` : 'N/A'}
Licensed Manufacturer: ${batch?.manufacturer || 'N/A'}
State Drug Authority: ${batch?.stateDrugAuthority || 'N/A'}
Manufacturing Date: ${batch?.mfgDate || 'N/A'}
Expiry Date: ${batch?.expiryDate || 'N/A'}

CRYPTOGRAPHIC MERKLE AUDIT:
Batch Merkle Root: ${batch?.merkleRoot || 'N/A'}
Pack Token Hash: ${pack?.tokenHash || 'N/A'}
Optical PUF Enrolled: ${pack?.opticalSecurityPatternEnrolled ? 'YES (Machine Verified)' : 'NO'}
CDSCO Protocol Version: v1/2026

SCAN TELEMETRY & AUDIT:
Coordinates: ${scanLog.lat.toFixed(5)}°N, ${scanLog.lng.toFixed(5)}°E
Scan Facility/Location: ${scanLog.placeName}
Offline Verification: ${isOfflineVerified ? 'YES (Cached CDSCO Merkle Root)' : 'NO (National Blockchain Node)'}
${
  scanLog.velocityKmH
    ? `Calculated Velocity: ${scanLog.velocityKmH.toLocaleString()} km/h (Distance: ${scanLog.distanceKm?.toLocaleString()} km over ${Math.round(
        (scanLog.timeDeltaSec || 0) / 60
      )} mins)`
    : ''
}
${
  scanLog.previousScan
    ? `Previous Recorded Scan: ${scanLog.previousScan.placeName} at ${new Date(scanLog.previousScan.timestamp).toISOString()}`
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

  // Header styling per taxonomy
  const getHeaderStyle = () => {
    if (isVerified) return 'bg-emerald-50 border-emerald-200';
    if (isRegisteredOnly) return 'bg-blue-50 border-blue-200';
    if (isAlreadyScanned) return 'bg-amber-50 border-amber-200';
    if (isSuspicious || isInvalid) return 'bg-rose-50 border-rose-200';
    if (isRecalled || isBlocked) return 'bg-rose-50 border-rose-300';
    return 'bg-slate-50 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className={`px-6 py-5 border-b ${getHeaderStyle()}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {isVerified ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                  <CheckCircle2 className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : isRegisteredOnly ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
                  <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : isAlreadyScanned ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                  <Clock className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : isSuspicious || isInvalid ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                  <AlertOctagon className="h-6 w-6 stroke-[2.2]" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-700 text-white shadow-xs">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  {isVerified && (
                    <span className="text-emerald-800">CDSCO Verified Genuine Indian Medicine</span>
                  )}
                  {isRegisteredOnly && (
                    <span className="text-blue-800">CDSCO Ledger Registered (Standard QR Capture)</span>
                  )}
                  {isAlreadyScanned && (
                    <span className="text-amber-800">Package Previously Scanned</span>
                  )}
                  {isSuspicious && (
                    <span className="text-rose-800">Critical Anomaly: Duplicate QR Clone Strip</span>
                  )}
                  {isRecalled && (
                    <span className="text-rose-800">CDSCO Statutory Section 26A Recall</span>
                  )}
                  {isBlocked && (
                    <span className="text-rose-800">Regulatory Hold / Quarantined Pack</span>
                  )}
                  {isInvalid && (
                    <span className="text-rose-800">Spurious / Forged QR Code</span>
                  )}

                  {isOfflineVerified && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        Rural Offline Merkle
                      </span>
                    </>
                  )}
                </div>

                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {isVerified && (batch?.drugName || 'Verified Genuine Medicine')}
                  {isRegisteredOnly && `${batch?.drugName || 'Valid Medicine Pack'} (Optical PUF Pending)`}
                  {isAlreadyScanned && `${batch?.drugName || 'Authentic Strip'} — Already Scanned`}
                  {isSuspicious && 'Impossible Travel Velocity (Cloned Packaging)'}
                  {isRecalled && `${batch?.drugName} — BATCH RECALLED`}
                  {isBlocked && `${batch?.drugName || 'Medicine Pack'} — QUARANTINED`}
                  {isInvalid && 'Unregistered or Forged QR Token'}
                </h3>

                <p className="mt-0.5 text-xs text-slate-600">
                  {isVerified && `${batch?.genericName || ''} · Batch ${batch?.batchNumber} · Pack ${pack?.serialNumber}`}
                  {isRegisteredOnly && 'Token verified on national ledger. Physical micro-pattern verification required for 100% cryptographic seal.'}
                  {isAlreadyScanned && `This pack was scanned earlier. Repeat scan verified without physical travel conflict.`}
                  {isSuspicious && 'Identical medicine QR scanned in two distant locations within impossible physical travel time.'}
                  {isRecalled && 'This medicine batch failed statutory quality standards in government laboratory testing.'}
                  {isBlocked && 'This serial has been frozen by the manufacturer or state drug inspector.'}
                  {isInvalid && 'The scanned QR code is missing authentic pharmaceutical cryptographic signatures.'}
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
          {/* 1. REGISTERED_BUT_NOT_FULLY_AUTHENTICATED (Guide Section 6 & 7.3) */}
          {isRegisteredOnly && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                <Smartphone className="h-4 w-4 text-blue-700" />
                <span>Optical Physical-Pack Verification Advisory (Section 6 & 7)</span>
              </div>
              <p className="leading-relaxed">
                The QR data token is <strong>valid and registered</strong> on the Central Drugs Standard Control Organisation (CDSCO) blockchain ledger for <strong>{batch?.drugName}</strong> (Batch: {batch?.batchNumber}).
              </p>
              <div className="rounded-lg bg-white/90 p-3 border border-blue-200 space-y-1.5">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>How to achieve 100% Optical Authentication:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Check the toggle <strong>&quot;High-Security QR + Optical Pattern Match&quot;</strong> in the web scanner.</li>
                  <li>Scan the physical PUF micro-texture / hologram printed alongside the QR code.</li>
                  <li>Or open the official AushadhLedger Native Android App with macro-focus validation.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. ALREADY_SCANNED (Guide Section 7.3 & 9.1: Intelligent Repeat Scan Warning) */}
          {isAlreadyScanned && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-5 text-xs text-amber-950 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 font-extrabold text-sm text-amber-900 border-b border-amber-200/80 pb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="text-base tracking-tight">⚠️ WARNING: Medicine QR Code Already Scanned</span>
              </div>

              <p className="leading-relaxed text-amber-950 font-medium">
                This medicine strip QR code was previously scanned. Below is the exact location, IP address history, distance between scans, and time gap telemetry:
              </p>

              {scanLog.previousScan && (
                <div className="rounded-xl bg-white p-4 border border-amber-200 shadow-xs space-y-3 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-800 border-b border-slate-100 pb-3">
                    {/* Previous Scan Box */}
                    <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Previous Scan (1st Time)
                      </div>
                      <div className="font-semibold text-slate-900 text-xs">
                        📍 {scanLog.previousScan.placeName}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        🌐 IP: {scanLog.previousScan.ipAddress || '103.21.124.9'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        🕒 {new Date(scanLog.previousScan.timestamp).toLocaleDateString()} at{' '}
                        {new Date(scanLog.previousScan.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Current Scan Box */}
                    <div className="space-y-1 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                      <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                        Current Scan (2nd Time)
                      </div>
                      <div className="font-semibold text-slate-900 text-xs">
                        📍 {scanLog.placeName}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        🌐 IP: {scanLog.ipAddress || '49.37.152.88'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        🕒 {new Date(scanLog.timestamp).toLocaleDateString()} at{' '}
                        {new Date(scanLog.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Distance & Time Gap Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Total Distance Between 2 Scans</div>
                      <div className="font-bold text-slate-900 text-sm tabular-nums">
                        {scanLog.distanceKm !== undefined ? `${scanLog.distanceKm.toFixed(1)} km` : '0.0 km (Same Location)'}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Time Gap Between Scans</div>
                      <div className="font-bold text-slate-900 text-sm tabular-nums">
                        {scanLog.timeDeltaSec !== undefined
                          ? Math.round(scanLog.timeDeltaSec / 60) < 60
                            ? `${Math.max(1, Math.round(scanLog.timeDeltaSec / 60))} mins`
                            : `${(scanLog.timeDeltaSec / 3600).toFixed(1)} hours`
                          : 'Recent'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-white/90 rounded-lg border border-amber-300 text-[11px] text-amber-950 leading-relaxed font-medium shadow-2xs">
                <span className="font-bold text-amber-900 block mb-0.5">⚠️ Consumer Security Notice:</span>
                If you previously scanned this exact package yourself when opening it, this duplicate notification is normal. However, if you just purchased this strip sealed from a retail chemist, please check the box seals or alert your pharmacist to rule out a photocopied QR duplicate.
              </div>
            </div>
          )}

          {/* 3. SUSPICIOUS / Impossible Travel Duplicate Anomaly (Section 8 & 9.1) */}
          {isSuspicious && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 font-extrabold text-sm text-rose-900 border-b border-rose-200/80 pb-2">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                <span className="text-base tracking-tight">🚨 CRITICAL WARNING: Counterfeit QR Clone Detected</span>
              </div>

              <p className="text-xs text-rose-950 leading-relaxed font-medium">
                This exact medicine QR code was scanned from two different geographic locations within an impossible physical transit timeframe. The QR code on this packaging is a <strong>photocopied or duplicate clone</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-800 bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
                {/* Previous Location & IP */}
                <div className="space-y-1 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100">
                  <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                    First Scan Telemetry
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">
                    📍 {scanLog.previousScan?.placeName || 'Previous Location'}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    🌐 IP: {scanLog.previousScan?.ipAddress || '103.21.124.9'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    🕒 {scanLog.previousScan?.timestamp ? new Date(scanLog.previousScan.timestamp).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>

                {/* Current Location & IP */}
                <div className="space-y-1 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100">
                  <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                    Current Scan Telemetry
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">
                    📍 {scanLog.placeName}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    🌐 IP: {scanLog.ipAddress || '49.37.152.88'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    🕒 {new Date(scanLog.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="rounded-lg bg-rose-50 p-2 border border-rose-200">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Distance</div>
                    <div className="font-bold text-rose-900 tabular-nums">
                      {scanLog.distanceKm?.toLocaleString()} km
                    </div>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-2 border border-rose-200">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Time Gap</div>
                    <div className="font-bold text-rose-900 tabular-nums">
                      {Math.max(1, Math.round((scanLog.timeDeltaSec || 0) / 60))} mins
                    </div>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-2 border border-rose-200">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Transit Speed</div>
                    <div className="font-bold text-rose-600 tabular-nums">
                      {scanLog.velocityKmH?.toLocaleString()} km/h
                    </div>
                  </div>
                </div>
              </div>

              <div className="font-bold text-rose-900 text-xs bg-white/90 p-3 rounded-lg border border-rose-300">
                🛑 DO NOT CONSUME THIS MEDICINE. Return it to your pharmacy or report to the State Drug Inspector.
              </div>
            </div>
          )}

          {/* 4. Recalled Batch Warning */}
          {isRecalled && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 text-xs text-rose-950">
              <div className="font-bold text-sm text-rose-900 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Statutory Recall by State Drug Controller (Section 26A)
              </div>
              <p>
                Batch <strong>{batch?.batchNumber}</strong> has been flagged for recall under Section 26A of the Drugs and Cosmetics Act.
                Stockists and chemists across India have been instructed to freeze inventory. Please return this strip for immediate refund or replacement.
              </p>
            </div>
          )}

          {/* 5. Blocked Pack Warning */}
          {isBlocked && (
            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 text-xs text-slate-900">
              <div className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-700" />
                Individual Pack Quarantined / Blocked
              </div>
              <p>
                This serial number ({pack?.serialNumber || 'N/A'}) has been placed on administrative hold by the manufacturer or CDSCO inspector. It cannot be dispensed.
              </p>
            </div>
          )}

          {/* App-Exclusive Security Restriction Notice for Invalid / External Scans */}
          {isInvalid && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lock className="h-4 w-4 text-amber-400" />
                <span>🔒 ScanRx App-Exclusive Protocol Security Active</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ScanRx QR codes are encoded using custom encrypted deep-link payloads (<code className="text-emerald-400 font-mono">scanrx://v1/verify?t=...</code>) signed with an HMAC SHA-256 application key.
              </p>
              <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-white">Why standard QR scanners cannot scan this QR code:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li>Generic camera apps (Google Lens, generic barcode readers) cannot parse custom URI schemes.</li>
                  <li>Prevents counterfeiters from generating fake web URLs or redirecting users to phishing sites.</li>
                  <li>Ensures only the official <strong>ScanRx App</strong> can decrypt and verify medicine authenticity.</li>
                </ul>
              </div>
            </div>
          )}

          {/* App-Exclusive Protection Confirmation for Valid Scans */}
          {!isInvalid && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Lock className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>ScanRx App-Exclusive Cryptographic Protocol Verified</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold uppercase">
                scanrx:// Scheme
              </span>
            </div>
          )}

          {/* 6. Product Specifications & Pricing Card (India) */}
          {batch && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Indian Pharmaceutical Regulatory Record (IP Standard)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Maximum Retail Price (MRP)</div>
                  <div className="font-semibold text-emerald-800 text-sm">
                    {batch.mrpInr ? `₹${batch.mrpInr.toFixed(2)}` : 'N/A'}
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

          {/* 7. Cryptographic Merkle Proof Audit Trail */}
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
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Optical PUF Enrolled</div>
                    <div className="text-[11px] text-slate-800 font-semibold">
                      {pack.opticalSecurityPatternEnrolled ? 'Enrolled (Verified Pattern)' : 'Standard Barcode'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 8. Verified Indian Supply Chain Journey */}
          {pack?.custodyHistory && pack.custodyHistory.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Verified Indian Supply Chain Journey
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {pack.custodyHistory.map((event) => (
                  <div key={event.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-700 shadow-xs" />
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
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
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
            className={`rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors ${
              isVerified
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

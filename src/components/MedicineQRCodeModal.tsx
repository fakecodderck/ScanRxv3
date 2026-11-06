import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Building2,
  Store,
  Calendar,
  Lock,
  Layers,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { MedicinePack, MedicineBatch } from '../types';

interface MedicineQRCodeModalProps {
  pack: MedicinePack;
  batch?: MedicineBatch;
  companyName?: string;
  pharmacyHolder?: string;
  onClose: () => void;
  onVerifyInScanner?: (token: string) => void;
}

export const MedicineQRCodeModal: React.FC<MedicineQRCodeModalProps> = ({
  pack,
  batch,
  companyName,
  pharmacyHolder,
  onClose,
  onVerifyInScanner,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      pack.secureToken,
      {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url && isMounted) {
          setQrDataUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [pack.secureToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pack.secureToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${pack.packId}_${pack.batchNumber}.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Medicine Strip Label - ${pack.packId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .label-card { border: 2px solid #0f172a; padding: 16px; border-radius: 8px; width: 340px; margin: auto; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
            .title { font-size: 14px; font-weight: 700; text-transform: uppercase; }
            .qr-img { width: 180px; height: 180px; display: block; margin: 0 auto; }
            .meta { font-size: 11px; margin-top: 12px; line-height: 1.4; }
            .bold { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <span class="title">CDSCO SECURE MEDICINE STRIP</span>
              <span style="font-size: 10px; font-weight: bold;">INDIA</span>
            </div>
            <img src="${qrDataUrl}" class="qr-img" />
            <div class="meta">
              <div><span class="bold">Drug:</span> ${batch?.drugName || 'Pharmaceutical Strip'}</div>
              <div><span class="bold">Composition:</span> ${batch?.genericName || 'Active IP formulation'}</div>
              <div><span class="bold">Batch No:</span> ${pack.batchNumber} · <span class="bold">Serial:</span> ${pack.serialNumber}</div>
              <div><span class="bold">Pack ID:</span> ${pack.packId}</div>
              <div><span class="bold">Mfg / Exp:</span> ${batch?.mfgDate || 'N/A'} / ${batch?.expiryDate || 'N/A'}</div>
              ${batch?.mrpInr ? `<div><span class="bold">MRP:</span> ₹${batch.mrpInr.toFixed(2)} (Incl. of all taxes)</div>` : ''}
              <div><span class="bold">Licensed MFR:</span> ${companyName || batch?.manufacturer || 'Sun Pharma Laboratories'}</div>
              <div><span class="bold">Token Hash:</span> ${pack.tokenHash.substring(0, 16)}...</div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
              <QrCode className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Serialized Medicine Package QR Code
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {pack.packId} · {batch?.drugName || pack.batchNumber}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="relative flex shrink-0 items-center justify-center rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${pack.packId}`}
                  className="h-44 w-44 object-contain"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center text-xs text-slate-400 font-mono">
                  Generating QR...
                </div>
              )}

              {/* Optical pattern indicator badge */}
              {pack.opticalSecurityPatternEnrolled && (
                <div
                  title="Optical PUF pattern embedded on physical foil"
                  className="absolute bottom-1 right-1 rounded-md bg-emerald-700 p-1 text-white shadow-xs"
                >
                  <Sparkles className="h-3 w-3" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold uppercase text-[10px] tracking-wide">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>CDSCO Blockchain Serialized QR Code</span>
              </div>

              <div className="text-base font-bold text-slate-900">
                {batch?.drugName || 'Pharmaceutical Formulation'}
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {batch?.genericName || 'Active Pharmaceutical Ingredient (IP)'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-sans uppercase">Batch Number</div>
                  <div className="font-bold text-slate-900">{pack.batchNumber}</div>
                </div>

                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-sans uppercase">Serial Number</div>
                  <div className="font-bold text-slate-900">{pack.serialNumber}</div>
                </div>

                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-sans uppercase">Expiry Date</div>
                  <div className="font-semibold text-slate-900">{batch?.expiryDate || pack.expiryDate}</div>
                </div>

                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-sans uppercase">Mfg Date</div>
                  <div className="font-semibold text-slate-900">
                    {batch?.mfgDate || pack.manufactureDate || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custody & Entity Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Supply Chain Registry & Custody
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Manufacturing Company</div>
                  <div className="font-semibold text-slate-900">
                    {companyName || batch?.manufacturer || 'Sun Pharma Laboratories Ltd.'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Lic: {batch?.mfgLicenseNo || 'S-MNB/09/42 (HP)'}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 flex items-start gap-2.5">
                <Store className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Current Custody / Pharmacy</div>
                  <div className="font-semibold text-slate-900">
                    {pharmacyHolder || pack.currentHolder}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    Pack Status: {pack.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Attributes */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="font-sans font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Cryptographic Token Payload</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-sans font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-700 break-all select-all">
              {pack.secureToken}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Token SHA-256 Hash</div>
                <div className="truncate text-slate-800" title={pack.tokenHash}>
                  {pack.tokenHash}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Batch Merkle Root</div>
                <div className="truncate text-slate-800" title={batch?.merkleRoot}>
                  {batch?.merkleRoot || '0x4f8a...e91c'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Label</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onVerifyInScanner && (
              <button
                onClick={() => {
                  onClose();
                  onVerifyInScanner(pack.secureToken);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Test Verify QR</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

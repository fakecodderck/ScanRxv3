import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  MapPin,
  RefreshCw,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
  HelpCircle,
  Keyboard,
  Compass
} from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { VerificationResultModal } from './VerificationResultModal';

function playScanBeep(isSuccess = true) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isSuccess) {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Ignore audio permission error
  }
}

export const PublicScanner: React.FC = () => {
  const { verifyMedicineScan, packs, batches, isOfflineMode } = useLedgerStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationOutput, setVerificationOutput] = useState<any>(null);

  // Indian Geolocation state (default fallback New Delhi)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    placeName: string;
    isLocked: boolean;
  }>({
    lat: 28.6139,
    lng: 77.2090,
    accuracy: 15,
    placeName: 'Acquiring GPS fix (India)...',
    isLocked: false,
  });

  const refreshLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setUserLocation({
            lat,
            lng,
            accuracy,
            placeName: `India GPS Fix (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E / ±${accuracy}m)`,
            isLocked: true,
          });
        },
        (err) => {
          console.warn('Geolocation access issue:', err.message);
          setUserLocation({
            lat: 28.6139,
            lng: 77.2090,
            accuracy: 25,
            placeName: 'Connaught Place, New Delhi (Default Node)',
            isLocked: true,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was not granted or camera is busy. Test with 1-click Indian test packages or enter the token below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (
        cameraActive &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        !isProcessing &&
        !verificationOutput
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              handleProcessScan(code.data);
            }
          }
        }
      }
      if (cameraActive) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    if (cameraActive) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, isProcessing, verificationOutput]);

  const handleProcessScan = (tokenToVerify: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      const output = verifyMedicineScan({
        scannedText: tokenToVerify,
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        placeName: userLocation.placeName,
      });

      playScanBeep(output.result === 'verified_authentic');
      setVerificationOutput(output);
      setIsProcessing(false);
    }, 400);
  };

  // 1-Click Interactive Test Scenarios for Indian Top Medicines
  const testScenarios = [
    {
      id: 'authentic_augmentin',
      label: 'Authentic Augmentin 625 Duo (Sun Pharma Baddi)',
      description: 'Manufactured in Baddi (HP), certified cold chain custody to Bengaluru. Passes Indian Pharmacopoeia standards.',
      tag: 'Legitimate IP Medicine',
      tagColor: 'text-emerald-800 font-semibold',
      action: () => {
        const pack = packs.find((p) => p.batchNumber === 'LOT-AUG-8821' && p.serialNumber === 'SN-0002');
        if (pack) handleProcessScan(pack.secureToken);
      },
    },
    {
      id: 'impossible_travel_dolo',
      label: 'Impossible Travel Alert (Dolo 650 Duplicate Strip)',
      description: 'Scanned in Apollo Pharmacy Chennai 11 min ago. Scanning from Delhi/North India triggers ~11,800 km/h impossible travel speed!',
      tag: 'Critical Clone Alert',
      tagColor: 'text-rose-700 font-semibold',
      action: () => {
        const pack = packs.find((p) => p.batchNumber === 'LOT-DOLO-9921' && p.serialNumber === 'SN-0001');
        if (pack) handleProcessScan(pack.secureToken);
      },
    },
    {
      id: 'recalled_pand',
      label: 'Recalled Spurious Batch (Pan-D Lot 4412)',
      description: 'Officially quarantined by CDSCO & Himachal Drug Controller under Section 26A.',
      tag: 'CDSCO Recalled Batch',
      tagColor: 'text-amber-800 font-semibold',
      action: () => {
        const pack = packs.find((p) => p.batchNumber === 'LOT-PAN-4412');
        if (pack) handleProcessScan(pack.secureToken);
      },
    },
    {
      id: 'forged_fake',
      label: 'Spurious Counterfeit Strip (Forged CDSCO QR)',
      description: 'Counterfeit packaging with unverified cryptographic signature and bogus batch licensing.',
      tag: 'Spurious Drug Warning',
      tagColor: 'text-rose-800 font-semibold',
      action: () => {
        handleProcessScan('meditrust://v1/verify?t=FORGED_INDIAN_SPURIOUS_COMPOUND_XX99&sig=FAKESIG');
      },
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>CDSCO & MoHFW Compliant</span>
          <span aria-hidden="true">·</span>
          <span>Open to all Indian Citizens</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
          Scan Indian Medicine Strip to Verify Authenticity Instantly
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          Point your mobile camera at the mandatory QR code printed on top Indian medicine strips (Dolo, Augmentin, Pan-D, etc.).
          Our national blockchain validates manufacturing licenses and catches spurious packaging duplicates in real time.
        </p>

        {/* Live GPS Lock Indicator */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-xs">
          <MapPin className="h-3.5 w-3.5 text-emerald-700" />
          <span className="font-medium text-slate-900">Active Location:</span>
          <span className="font-mono text-slate-600">{userLocation.placeName}</span>
          <button
            onClick={refreshLocation}
            title="Refresh GPS Coordinates"
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Camera Viewfinder */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-lg flex flex-col items-center justify-center text-white">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Optical Targeting Reticle */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                    <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                </div>

                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[11px] font-mono text-white/90 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    CDSCO QR Scanner Active
                  </span>
                  <span>{isOfflineMode ? 'RURAL OFFLINE CACHE' : 'NATIONAL BLOCKCHAIN'}</span>
                </div>

                <div className="absolute bottom-4">
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-slate-900 border border-white/20 transition-all"
                  >
                    <CameraOff className="h-4 w-4" />
                    <span>Pause Camera</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4 max-w-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 text-emerald-400">
                  <Camera className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Smartphone QR Scanner</h3>
                  <p className="text-xs text-slate-400">
                    Align your phone camera over the security QR printed on the medicine blister foil or bottle carton.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  <span>Open Camera to Scan Medicine</span>
                </button>
                {cameraError && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800 text-left">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Manual Token Entry Fallback */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-slate-500" />
                <span>Manual Token / Pack Serial Verification</span>
              </label>
              <span className="text-[10px] text-slate-400">CDSCO App-Exclusive Protocol</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste meditrust:// token or Pack ID (e.g. IND-AUG-8821-0002)"
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (manualCode.trim()) handleProcessScan(manualCode.trim());
                }}
                disabled={!manualCode.trim() || isProcessing}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Interactive Indian Medicine Scenarios */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Zap className="h-3.5 w-3.5 fill-emerald-700 text-emerald-700" />
                <span>Interactive Indian Medicine Barcodes</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                1-Click Verification Test Scenarios
              </h2>
              <p className="text-xs text-slate-500">
                Test the cryptographic verification engine and impossible travel radar on top Indian pharmaceutical formulations:
              </p>
            </div>

            <div className="space-y-3">
              {testScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={scenario.action}
                  disabled={isProcessing}
                  className="w-full text-left rounded-xl border border-slate-200 p-3.5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                      {scenario.label}
                    </span>
                    <span className={`text-[11px] whitespace-nowrap shrink-0 ${scenario.tagColor}`}>
                      {scenario.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Rural Low-Connectivity Caching Guidance */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                {isOfflineMode ? (
                  <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Wifi className="h-3.5 w-3.5 text-emerald-700" />
                )}
                <span>Rural Low-Connectivity Caching (Jan Aushadhi)</span>
              </div>
              <p className="text-[11px]">
                {isOfflineMode
                  ? 'Offline mode active. Validating medicine packs against cached CDSCO Merkle manifests in low-network regions.'
                  : 'Connected directly to the national blockchain ledger. Scans synchronize in real-time across Indian states.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Result Modal */}
      {verificationOutput && (
        <VerificationResultModal
          result={verificationOutput.result}
          pack={verificationOutput.pack}
          batch={verificationOutput.batch}
          scanLog={verificationOutput.scanLog}
          alert={verificationOutput.alert}
          isOfflineVerified={verificationOutput.isOfflineVerified}
          onClose={() => setVerificationOutput(null)}
        />
      )}
    </div>
  );
};

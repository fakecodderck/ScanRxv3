import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  ShieldCheck,
  Keyboard,
  Sparkles,
  MapPin
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

interface PublicScannerProps {
  onOpenAuth?: (mode: 'login' | 'signup', role?: 'admin' | 'company' | 'distributor' | 'pharmacy') => void;
}

export const PublicScanner: React.FC<PublicScannerProps> = () => {
  const { verifyMedicineScan } = useLedgerStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationOutput, setVerificationOutput] = useState<any>(null);
  const [userIp, setUserIp] = useState<string>('49.37.152.88');

  // Interactive scan location state (allows user/tester to test distance from different cities!)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; placeName: string }>({
    lat: 28.6139,
    lng: 77.2090,
    placeName: 'Connaught Place Node, New Delhi',
  });

  // Fetch real client public IP address on mount
  useEffect(() => {
    let mounted = true;
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.ip) {
          setUserIp(data.ip);
        }
      })
      .catch(() => {
        // Fallback IP if offline or blocked
        setUserIp('49.37.152.88');
      });

    // Try HTML5 geolocation if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              placeName: `Local Device GPS (${pos.coords.latitude.toFixed(3)}°, ${pos.coords.longitude.toFixed(3)}°)`,
            });
          }
        },
        () => {
          // Keep default node
        },
        { timeout: 5000 }
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // Fallback for laptops/desktops without rear camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraActive(true);

      // Allow React state update to ensure element is ready, then attach stream
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play error:', playErr);
          }
        }
      }, 50);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was not granted or no video device was found. Enter token below or click a sample pack to test.'
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

  const handleProcessScan = (tokenToVerify: string, forceOptical: boolean = true) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      const output = verifyMedicineScan({
        scannedText: tokenToVerify,
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        placeName: userLocation.placeName,
        userIp: userIp,
        opticalAuthRequested: forceOptical,
      });

      playScanBeep(output.result === 'VERIFIED' || output.result === 'verified_authentic');
      setVerificationOutput(output);
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 overflow-hidden">
      {/* Ambient background glowing orbs for glassmorphism */}
      <div className="absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl" />

      <div className="w-full max-w-xl space-y-6">
        {/* Glassmorphic Container Card */}
        <div className="backdrop-blur-2xl bg-white/75 border border-white/65 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.07)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>CDSCO Authenticity Verification</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Verify Medicine Strip
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Scan the QR code printed on the medicine blister pack or carton to verify genuine manufacturing and batch validity.
            </p>
          </div>

          {/* Main Scanner Section */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-white">
              {/* Always mounted video element so videoRef.current is never null */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraActive ? (
                <>
                  {/* Reticle Overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                      <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  </div>

                  <div className="absolute bottom-4">
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-slate-900 border border-white/20 transition-all shadow-md"
                    >
                      <CameraOff className="h-4 w-4" />
                      <span>Pause Camera</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center space-y-4 max-w-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 text-emerald-400 shadow-inner">
                    <Camera className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Camera Scanner</h3>
                    <p className="text-xs text-slate-400">
                      Align your phone camera over the QR code on the medicine strip or carton.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Open Camera to Scan</span>
                  </button>
                  {cameraError && (
                    <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800 text-left">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-4 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-slate-500" />
                <span>Or Enter Token / Pack Serial ID</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. IND-AUG-8821-0002 or IND-DOLO-9921-0001"
                  className="flex-1 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none shadow-xs"
                />
                <button
                  onClick={() => {
                    if (manualCode.trim()) handleProcessScan(manualCode.trim());
                  }}
                  disabled={!manualCode.trim() || isProcessing}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                >
                  Verify
                </button>
              </div>

              {/* Quick Sample Pack Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-500">Test Packs:</span>
                <button
                  onClick={() => handleProcessScan('IND-AUG-8821-0002')}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-semibold"
                >
                  Augmentin #0002
                </button>
                <button
                  onClick={() => handleProcessScan('IND-DOLO-9921-0001')}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-semibold"
                >
                  Dolo #0001
                </button>
              </div>
            </div>

            {/* Live Scan Location & IP Indicator */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 backdrop-blur-md p-3.5 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Recorded Telemetry (IP & Geolocation)</span>
                </div>
                <span className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-semibold">
                  IP: {userIp}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-600">Scan Node: <strong className="text-slate-900">{userLocation.placeName}</strong></span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[10px]">Simulate Location:</span>
                  <select
                    value={userLocation.placeName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes('New Delhi')) {
                        setUserLocation({ lat: 28.6139, lng: 77.2090, placeName: 'Connaught Place Node, New Delhi' });
                        setUserIp('49.37.152.88');
                      } else if (val.includes('Mumbai')) {
                        setUserLocation({ lat: 19.0760, lng: 72.8777, placeName: 'Bandra West Terminal, Mumbai' });
                        setUserIp('103.21.124.9');
                      } else if (val.includes('Bengaluru')) {
                        setUserLocation({ lat: 12.9716, lng: 77.5946, placeName: 'Indiranagar Hub, Bengaluru' });
                        setUserIp('115.240.90.12');
                      } else if (val.includes('Chennai')) {
                        setUserLocation({ lat: 13.0827, lng: 80.2707, placeName: 'Anna Nagar, Chennai' });
                        setUserIp('117.218.42.5');
                      }
                    }}
                    className="rounded-md border border-emerald-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-950 focus:outline-none"
                  >
                    <option value="Connaught Place Node, New Delhi">New Delhi (IP: 49.37.152.88)</option>
                    <option value="Bandra West Terminal, Mumbai">Mumbai (IP: 103.21.124.9)</option>
                    <option value="Indiranagar Hub, Bengaluru">Bengaluru (IP: 115.240.90.12)</option>
                    <option value="Anna Nagar, Chennai">Chennai (IP: 117.218.42.5)</option>
                  </select>
                </div>
              </div>
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
          priorPublicScanCount={verificationOutput.priorPublicScanCount}
          isOfflineVerified={verificationOutput.isOfflineVerified}
          onClose={() => setVerificationOutput(null)}
        />
      )}
    </div>
  );
};

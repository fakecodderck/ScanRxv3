import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  ShieldCheck,
  Keyboard,
  Sparkles,
  MapPin,
  Locate,
  Navigation,
  RefreshCw,
  CheckCircle2,
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
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'locating'>('prompt');
  const [isRealGPSActive, setIsRealGPSActive] = useState<boolean>(false);

  // Scan location state (defaults to New Delhi until GPS permission granted)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; placeName: string }>({
    lat: 28.6139,
    lng: 77.2090,
    placeName: 'Connaught Place Node, New Delhi',
  });

  const fetchUserGPSLocation = (isInitial = false) => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let placeName = `GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.city || '';
            const city = data.city && data.city !== locality ? data.city : '';
            const state = data.principalSubdivision || '';
            const parts = [locality, city, state].filter(Boolean);
            if (parts.length > 0) {
              placeName = `${parts.join(', ')} (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
            }
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        }

        setUserLocation({ lat, lng, placeName });
        setLocationStatus('granted');
        setIsRealGPSActive(true);
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        setLocationStatus('denied');
        if (!isInitial) {
          alert('Location permission was not granted or GPS is disabled. Please enable location permissions in browser settings.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fetch client IP and attempt real GPS location on mount
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
        setUserIp('49.37.152.88');
      });

    fetchUserGPSLocation(true);

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



            {/* Live Scan Location & IP Indicator */}
            <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 backdrop-blur-md p-4 text-xs text-slate-700 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                  </div>
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>Real Consumer Telemetry & Geolocation</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                    IP: {userIp}
                  </span>
                  
                  {isRealGPSActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Live Device GPS Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => fetchUserGPSLocation(false)}
                      disabled={locationStatus === 'locating'}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs"
                    >
                      <Locate className="h-3 w-3" />
                      <span>{locationStatus === 'locating' ? 'Locating...' : 'Allow GPS Location'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                        Active Verification Scan Location
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">
                        {userLocation.placeName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Lat: {userLocation.lat.toFixed(4)}° · Lng: {userLocation.lng.toFixed(4)}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => fetchUserGPSLocation(false)}
                      disabled={locationStatus === 'locating'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Request or update live device GPS coordinates"
                    >
                      <RefreshCw className={`h-3 w-3 text-emerald-700 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
                      <span>Update GPS</span>
                    </button>

                    <div className="relative">
                      <select
                        value={isRealGPSActive ? 'CUSTOM' : userLocation.placeName}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'GPS') {
                            fetchUserGPSLocation(false);
                          } else if (val.includes('New Delhi')) {
                            setIsRealGPSActive(false);
                            setUserLocation({ lat: 28.6139, lng: 77.2090, placeName: 'Connaught Place Node, New Delhi' });
                            setUserIp('49.37.152.88');
                          } else if (val.includes('Mumbai')) {
                            setIsRealGPSActive(false);
                            setUserLocation({ lat: 19.0760, lng: 72.8777, placeName: 'Bandra West Terminal, Mumbai' });
                            setUserIp('103.21.124.9');
                          } else if (val.includes('Bengaluru')) {
                            setIsRealGPSActive(false);
                            setUserLocation({ lat: 12.9716, lng: 77.5946, placeName: 'Indiranagar Hub, Bengaluru' });
                            setUserIp('115.240.90.12');
                          } else if (val.includes('Chennai')) {
                            setIsRealGPSActive(false);
                            setUserLocation({ lat: 13.0827, lng: 80.2707, placeName: 'Anna Nagar, Chennai' });
                            setUserIp('117.218.42.5');
                          }
                        }}
                        className="rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-950 focus:outline-none shadow-2xs"
                      >
                        {isRealGPSActive && <option value="CUSTOM">📍 Live Real GPS</option>}
                        <option value="GPS">🎯 Use My Real Location</option>
                        <option value="Connaught Place Node, New Delhi">Simulate New Delhi</option>
                        <option value="Bandra West Terminal, Mumbai">Simulate Mumbai</option>
                        <option value="Indiranagar Hub, Bengaluru">Simulate Bengaluru</option>
                        <option value="Anna Nagar, Chennai">Simulate Chennai</option>
                      </select>
                    </div>
                  </div>
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

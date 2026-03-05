'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState, Html5QrcodeScanType } from 'html5-qrcode';

interface QrcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
  facingMode?: 'user' | 'environment';
}

const QrcodeScanner = ({ onScanSuccess, onScanFailure, facingMode }: QrcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Determine the best video constraints. 
    // If facingMode is provided, we try it, otherwise we don't constrain it to avoid NotFoundError.
    const videoConstraints = facingMode 
      ? { facingMode: { ideal: facingMode } } 
      : true;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: videoConstraints,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      // This prevents the scanner from crashing if the ideal camera isn't found
      rememberLastUsedCamera: true,
    };

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      /* verbose= */ false
    );

    scannerRef.current = scanner;
    
    // Start scanning
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
        const cleanup = async () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                        await scannerRef.current.clear();
                    }
                } catch (error) {
                    // Silently ignore cleanup issues
                }
            }
        };
        cleanup();
    };
  }, [onScanSuccess, onScanFailure, facingMode]);

  return <div id="qr-reader" className="w-full overflow-hidden bg-black/5 min-h-[300px] flex items-center justify-center rounded-xl border border-muted"></div>;
};

export default QrcodeScanner;

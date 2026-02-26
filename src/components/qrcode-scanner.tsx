'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState, Html5QrcodeScanType } from 'html5-qrcode';

interface QrcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
  facingMode: 'user' | 'environment';
}

const QrcodeScanner = ({ onScanSuccess, onScanFailure, facingMode }: QrcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Create new scanner instance
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: {
          facingMode: facingMode
        },
        // Disable file selection as requested
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
        const cleanup = async () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                        await scannerRef.current.clear();
                    }
                } catch (error) {
                    console.warn("Cleanup of scanner failed", error);
                }
            }
        };
        cleanup();
    };
  }, [onScanSuccess, onScanFailure, facingMode]);

  return <div id="qr-reader" className="w-full overflow-hidden rounded-md border bg-muted/20"></div>;
};

export default QrcodeScanner;
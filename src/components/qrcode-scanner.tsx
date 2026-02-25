'use client';

import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState, Html5QrcodeScanType } from 'html5-qrcode';

interface QrcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
  facingMode: 'user' | 'environment';
}

const QrcodeScanner = ({ onScanSuccess, onScanFailure, facingMode }: QrcodeScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: {
          facingMode: facingMode
        },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
        const stopScanning = async () => {
            try {
                if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
                    await scanner.clear();
                }
            } catch (error) {
                // html5-qrcode has a bug where calling clear() on an already cleared/stopped scanner throws.
                // We can safely ignore this error if it's the expected one.
                if (typeof error !== 'string' || !error.includes('not found on substrate')) {
                     console.error("Failed to clear html5-qrcode-scanner.", error);
                }
            }
        };
        stopScanning();
    };
  }, [onScanSuccess, onScanFailure, facingMode]);

  return <div id="qr-reader" className="w-full"></div>;
};

export default QrcodeScanner;

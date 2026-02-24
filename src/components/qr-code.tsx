'use client';
import React, { useEffect, useRef } from 'react';

// This relies on the external script loaded in layout.tsx
declare const QRCode: any;

interface QRCodeComponentProps {
  text: string;
  width?: number;
  height?: number;
  className?: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ text, width = 128, height = 128, className }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current) {
        // Clear previous QR code
        qrRef.current.innerHTML = '';
        
        // Check if QRCode library is loaded
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrRef.current, {
                text: text,
                width: width,
                height: height,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        } else {
            // Fallback or error message if library fails to load
            qrRef.current.innerHTML = 'QR Error';
        }
    }
  }, [text, width, height]);

  return <div ref={qrRef} className={className}></div>;
};

export default QRCodeComponent;

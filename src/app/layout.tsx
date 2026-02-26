import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { UserManagementProvider } from '@/contexts/user-management-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeManager } from '@/components/theme-manager';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'G P T',
  description: 'Attendance and School Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserManagementProvider>
            <ThemeManager />
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </UserManagementProvider>
        </ThemeProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

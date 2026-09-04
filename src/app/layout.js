import { Outfit } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import "./responsive.css";
import { Toaster } from 'react-hot-toast';
import DomErrorHandler from '@/components/DomErrorHandler';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: {
    template: '%s | MERKÜR REFERANS',
    default: 'MERKÜR REFERANS | Canlı Ders ve Referans Yönetim Platformu',
  },
  description: 'Canlı Ders Yönetimi, Referans ve Komisyon Takip Sistemi',
  keywords: ['canlı ders', 'referans sistemi', 'komisyon', 'eğitim'],
  authors: [{ name: 'MERKÜR REFERANS' }],
  creator: 'MERKÜR REFERANS',
  openGraph: {
    title: 'MERKÜR REFERANS',
    description: 'Canlı Ders Yönetimi',
    url: 'https://merkur.com',
    siteName: 'MERKÜR REFERANS',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MERKÜR REFERANS',
    description: 'Canlı Ders Yönetimi',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
      <html
      lang="tr"
      className={`${outfit.variable} h-full antialiased notranslate`}
      translate="no"
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <DomErrorHandler />
        <NextTopLoader color="#06b6d4" height={3} showSpinner={false} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

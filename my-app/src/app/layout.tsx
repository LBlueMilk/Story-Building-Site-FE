import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import {  metadata as siteMetadata } from './metadata'; // 匯入metadata
import RootClient from './layout.client'; // Client功能

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = siteMetadata; //確保匯出metadata
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Google Analytics 追蹤碼 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-60G40RSS3T"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-60G40RSS3T');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}

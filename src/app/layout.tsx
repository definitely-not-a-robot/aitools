import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's not directly used and covered by GeistSans export.
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = GeistSans;
// const geistMono = GeistMono; // Removed as GeistMono import is removed.

export const metadata: Metadata = {
  title: 'Link Summarizer',
  description: 'Summarize website links and export them.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} font-sans antialiased`} // Removed geistMono.variable as it's no longer defined
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

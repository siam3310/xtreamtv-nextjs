import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'XtreamTV',
  description: 'IPTV Streaming Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://vjs.zencdn.net/8.12.0/video-js.css"
        />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col h-screen bg-black text-white">
          <Navbar />
          <main className="flex-grow overflow-hidden">{children}</main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}

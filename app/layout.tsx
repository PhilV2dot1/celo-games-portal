import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { readFileSync } from "fs";
import { join } from "path";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://celo-games-portal.vercel.app';
const siteTitle = 'Celo Games Portal - Play Mini-Games on Celo Blockchain';
const siteDescription = 'Play 27 mini-games on Celo! Blackjack, Poker, Snake, Wordle, Tetris, Crypto Higher/Lower and more. Free mode, on-chain & multiplayer. MiniPay compatible.';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FCFF52' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CeloGames',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Celo Games Portal',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Celo Games Portal — 27 mini-games on Celo blockchain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
  },
  other: {
    // Farcaster Mini App frame
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${siteUrl}/og-image.png`,
      button: {
        title: '🎮 Play Now',
        action: {
          type: 'launch_frame',
          name: 'Celo Games Portal',
          url: siteUrl,
          splashImageUrl: `${siteUrl}/icon-512.png`,
          splashBackgroundColor: '#111827',
        },
      },
    }),
    // MiniPay / Opera Mini hints
    'dapp-name': 'Celo Games Portal',
    'dapp-url': siteUrl,
    'dapp-icon': `${siteUrl}/icon-512.png`,
    'dapp-description': siteDescription,
    'dapp-network': 'celo',
    'mobile-web-app-capable': 'yes',
    // Talent.app project verification
    'talentapp:project_verification': 'eb4d3ab607f351341b62045f43a42a6fcf7611403c918dbc109221e969fa2dfd0cc0b38a5845293270483e12a0e63f31e286c7c00f49580ec997f5939e0d6c1a',
  },
};

const svgSprite = readFileSync(join(process.cwd(), "public/svg-cards.svg"), "utf8");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased has-bottom-nav`}
      >
        {/* SVG cards sprite inlined — PlayingCard references #id directly */}
        <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: svgSprite }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

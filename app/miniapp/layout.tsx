import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://celo-games-portal.vercel.app';

export const metadata: Metadata = {
  title: 'Celo Games Portal — MiniPay Mini App',
  description: 'Play 27 mini-games on Celo directly in MiniPay. Wallet auto-connects, on-chain mode enabled. No sign-up needed.',
  openGraph: {
    title: 'Celo Games Portal — MiniPay Mini App',
    description: 'Play 27 mini-games on Celo directly in MiniPay. Wallet auto-connects.',
    url: `${siteUrl}/miniapp`,
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}

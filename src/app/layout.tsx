import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://guide.bkit.ai';

export const metadata: Metadata = {
  title: {
    default: 'bkit Guide - Claude Code Plugin Expert',
    template: '%s | bkit Guide',
  },
  description:
    'bkit (Claude Code Plugin) 설치, 설정, 사용법을 안내하는 AI 챗봇. PDCA 방법론, 개발 파이프라인, Skill/Agent 사용법을 친절하게 알려드립니다.',
  keywords: [
    'bkit',
    'Claude Code',
    'Claude Code Plugin',
    'AI 개발',
    'PDCA',
    'AI Native',
    '개발 도구',
    'Claude',
    'Anthropic',
  ],
  authors: [{ name: 'popup-studio-ai', url: 'https://bkit.ai' }],
  creator: 'popup-studio-ai',
  publisher: 'popup-studio-ai',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'bkit Guide',
    title: 'bkit Guide - Claude Code Plugin Expert',
    description:
      'bkit (Claude Code Plugin) 설치, 설정, 사용법을 안내하는 AI 챗봇. PDCA 방법론부터 고급 기능까지 친절하게 알려드립니다.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'bkit Guide - Claude Code Plugin Expert',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bkit Guide - Claude Code Plugin Expert',
    description:
      'bkit (Claude Code Plugin) 설치, 설정, 사용법을 안내하는 AI 챗봇',
    images: [`${siteUrl}/og-image.png`],
    creator: '@bkit_ai',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bkit Guide - Claude Code Plugin Expert',
  description: 'bkit (Claude Code Plugin) 설치, 설정, 사용법 가이드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-900">{children}</body>
    </html>
  );
}

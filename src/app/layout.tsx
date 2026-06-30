/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-11-19 15:55:09
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-03-11 16:02:20
 * @Description: 根布局文件
 */
import { Toast } from '@heroui/react';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import "./globals.css";
import { BaiDuAnalytics, GoogleUtilities, MicrosoftClarity, UmamiAnalytics } from '@/components/Analytics'
import AppTimeTicker from '@/components/AppTimeTicker';
import BackTop from '@/components/BackTop'
import Footer from '@/components/Footer'
import FullLoading from '@/components/FullLoading'
import Header from '@/components/Header'
import MainContent from '@/components/MainContent';
import { HOT_ITEMS, THEME_MODE } from '@/enums';
import pkg from '#/package.json';

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} - ${process.env.NEXT_PUBLIC_APP_DESC}`, // 网站标题
  description: process.env.NEXT_PUBLIC_APP_DESC, // 网站描述
  applicationName: pkg.name, // 应用名称
  authors: { name: pkg.author.name, url: pkg.author.url }, // 网站作者
  verification: {
    other: { 'baidu-site-verification': 'codeva-kYzuuOyYCZ', 'bytedance-verification-code': 'oPgCIrgBz/3Lhr9BoNE2' },
  }, // 网站验证
  keywords: HOT_ITEMS.items.map(({ raw }) => `${raw.label}${raw.tip}`).join(','), // 网站关键词
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESC,
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
    images: [{ url: `${process.env.NEXT_PUBLIC_APP_URL}/og.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESC,
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og.png`],
    creator: pkg.author.name,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      {/* 引入字体文件 */}
      <head>
        <meta name="version" content={pkg.version} />
        <link rel="stylesheet" href="/fonts/MapleMono-CN-Regular/result.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: process.env.NEXT_PUBLIC_APP_NAME,
              description: process.env.NEXT_PUBLIC_APP_DESC,
              url: process.env.NEXT_PUBLIC_APP_URL,
              publisher: {
                '@type': 'Organization',
                name: process.env.NEXT_PUBLIC_APP_NAME,
                logo: {
                  '@type': 'ImageObject',
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.svg`,
                },
              },
            }),
          }}
        />
        {/* Umami 统计 */}
        <UmamiAnalytics />
        {/* 百度统计 */}
        <BaiDuAnalytics />
        {/* Google 统计 */}
        <GoogleUtilities />
        {/* 微软统计 */}
        <MicrosoftClarity />
      </head>
      <body>
        {/* Vercel 分析 */}
        <Analytics />
        <NextThemesProvider attribute="class" defaultTheme={process.env.NEXT_PUBLIC_THEME || THEME_MODE.LIGHT}>
          <FullLoading />
          <Header />
          <MainContent>
            {children}
          </MainContent>
          <Footer />
          {/* 回到顶部 */}
          <BackTop />
          <AppTimeTicker />
          <Toast.Provider placement='top' />
        </NextThemesProvider>
      </body>
    </html>
  );
}

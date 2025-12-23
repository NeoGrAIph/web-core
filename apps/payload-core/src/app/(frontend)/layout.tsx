import type { Metadata } from 'next'

import dynamic from 'next/dynamic'
import { cookies, draftMode } from 'next/headers'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import { NnmNewYear } from '@/ui/nnm-newyear'

import './globals.css'

const AdminBar = dynamic(() => import('@/admin-ui/AdminBar').then((mod) => mod.AdminBar), {
  ssr: false,
})
const SharePreviewBarGate = dynamic(
  () => import('@/components/SharePreviewBar').then((mod) => mod.SharePreviewBarGate),
  { ssr: false },
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const cookieStore = await cookies()
  const hasAdminToken = Boolean(cookieStore.get('payload-token')?.value)

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <NnmNewYear newYearAssetsBase="/nnmclub_to-new_year" />
        <Providers>
          <SharePreviewBarGate />
          {hasAdminToken && (
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />
          )}

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}

import type { Metadata } from 'next'

import React from 'react'

import '../(frontend)/globals.css'

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}


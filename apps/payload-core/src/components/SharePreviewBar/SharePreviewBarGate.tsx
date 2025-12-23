'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

const SharePreviewBar = dynamic(() => import('./SharePreviewBar').then((mod) => mod.SharePreviewBar), {
  ssr: false,
})

export function SharePreviewBarGate() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    setShouldRender(Boolean(url.searchParams.get('sp')))
  }, [])

  if (!shouldRender) return null

  return <SharePreviewBar />
}

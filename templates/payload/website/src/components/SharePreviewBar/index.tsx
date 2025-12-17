'use client'

import React, { useEffect, useMemo, useState } from 'react'

type StatusResponse = { ok: true; active: boolean } | { ok: false; message: string }

function stripSharePreviewFlag(url: URL): string {
  url.searchParams.delete('sp')
  const qs = url.searchParams.toString()
  return `${url.pathname}${qs ? `?${qs}` : ''}${url.hash || ''}`
}

export function SharePreviewBar() {
  const [active, setActive] = useState(false)
  const [checking, setChecking] = useState(true)

  const url = useMemo(() => new URL(window.location.href), [])
  const sp = url.searchParams.get('sp') || ''
  const hasFlag = Boolean(sp)

  useEffect(() => {
    if (!hasFlag) {
      setChecking(false)
      return
    }

    const run = async () => {
      try {
        const res = await fetch(
          `/api/share-preview-status?path=${encodeURIComponent(url.pathname)}&sp=${encodeURIComponent(sp)}`,
          {
            credentials: 'include',
          },
        )
        const data = (await res.json()) as StatusResponse
        if (data.ok) setActive(Boolean(data.active))
      } catch {
        // ignore
      } finally {
        setChecking(false)
      }
    }

    run()
  }, [hasFlag, sp, url.pathname])

  if (!hasFlag || checking || !active) return null

  const exit = async () => {
    // Do not clear cookies here: exiting share preview only removes `sp` so the canonical URL shows published.
    // If user opens the same `?sp=<version>` link again, the banner and draft preview should re-appear.
    window.location.replace(stripSharePreviewFlag(new URL(window.location.href)))
  }

  return (
    <div className="sticky top-0 z-[60] border-b bg-amber-50 text-amber-950">
      <div className="container flex items-center justify-between gap-4 py-2 text-sm">
        <div className="font-medium">Share preview: вы смотрите черновик (не опубликовано)</div>
        <button
          className="rounded-md border border-amber-300 bg-white px-3 py-1 font-medium hover:bg-amber-100"
          type="button"
          onClick={exit}
        >
          Выйти
        </button>
      </div>
    </div>
  )
}


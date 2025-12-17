'use client'

import { useEffect, useState } from 'react'

type ExchangeResponse =
  | { ok: true; path: string }
  | { ok: false; message: string }

function getTokenFromHash(hash: string): string | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  return params.get('token')
}

export default function SharePreviewPage() {
  const [message, setMessage] = useState('Enabling preview…')

  useEffect(() => {
    const token = getTokenFromHash(window.location.hash)

    if (!token) {
      setMessage('Missing preview token')
      return
    }

    const run = async () => {
      try {
        const res = await fetch('/next/share-preview/exchange', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = (await res.json()) as ExchangeResponse

        if (!data.ok) {
          setMessage(data.message || 'Unable to enable preview')
          return
        }

        window.location.replace(data.path)
      } catch {
        setMessage('Unable to enable preview')
      }
    }

    run()
  }, [])

  return (
    <main className="container py-16">
      <h1 className="text-2xl font-semibold">Preview</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </main>
  )
}


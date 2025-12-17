'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

type ApiResponse = { ok: true; url: string; relative: string } | { ok: false; message: string }

function parseAdminDocFromPathname(pathname: string): { collection: 'pages' | 'posts' | null; id: string | null } {
  const parts = pathname.split('/').filter(Boolean)
  const collectionsIdx = parts.indexOf('collections')
  const collection = parts[collectionsIdx + 1]
  const id = parts[collectionsIdx + 2]

  if (!collection || !id || id === 'create') {
    return { collection: null, id: null }
  }

  if (collection !== 'pages' && collection !== 'posts') {
    return { collection: null, id: null }
  }

  return { collection, id }
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function CopySharePreviewLink() {
  const [loading, setLoading] = useState(false)

  const { collection, id } = useMemo(
    () => parseAdminDocFromPathname(typeof window === 'undefined' ? '' : window.location.pathname),
    [],
  )

  const handleClick = useCallback(async () => {
    if (!collection || !id) {
      toast.error('Save the document first to generate a share preview link.')
      return
    }

    if (loading) {
      toast.info('Generating link…')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/share-preview-link', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection, id }),
      })

      const data = (await res.json()) as ApiResponse

      if (!data.ok) {
        toast.error(data.message || 'Unable to generate link')
        return
      }

      await copyToClipboard(data.url)
      toast.success('Share preview link copied.')
    } catch {
      toast.error('Unable to generate link')
    } finally {
      setLoading(false)
    }
  }, [collection, id, loading])

  const label = loading ? 'Copy share preview link…' : 'Copy share preview link'

  return (
    <div className="copySharePreviewLink">
      <button className="copySharePreviewLink__button" type="button" onClick={handleClick}>
        {label}
      </button>
      <div className="copySharePreviewLink__hint">
        External link for clients (TTL 7 days). Requires login to generate.
      </div>
    </div>
  )
}


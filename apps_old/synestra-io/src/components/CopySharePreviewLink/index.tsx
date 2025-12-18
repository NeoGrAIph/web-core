'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { toast, useDocumentInfo, useFormFields, useTranslation } from '@payloadcms/ui'

import './index.scss'

type ApiResponse = { ok: true; url: string; relative: string } | { ok: false; message: string }

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

  const { id, collectionSlug } = useDocumentInfo()
  const { t } = useTranslation()

  const slugValue = useFormFields(([fields]) => fields?.slug?.value)
  const slug = typeof slugValue === 'string' ? slugValue : undefined

  const collection = collectionSlug === 'pages' || collectionSlug === 'posts' ? collectionSlug : null
  const docID = id === undefined || id === null ? null : String(id)

  const versionID = useMemo(() => {
    if (typeof window === 'undefined') return undefined

    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('version') || params.get('versionId') || params.get('v')
    if (fromQuery) return fromQuery

    const m = window.location.pathname.match(/\/versions\/([^/]+)$/)
    return m?.[1] || undefined
  }, [])

  const handleClick = useCallback(async () => {
    if (!collection || !docID) {
      toast.error(t('general:save', { defaultValue: 'Save' }) + ': ' + 'document is not created yet.')
      return
    }

    // Allow empty string for homepage, but require the field to exist in form state
    if (slug === undefined) {
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
        body: JSON.stringify({ collection, id: docID, versionID }),
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
  }, [collection, docID, loading, slug, t, versionID])

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

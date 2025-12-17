'use client'

import type { RowLabelProps } from '@payloadcms/ui'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

type LinkGroupRowData = {
  link?: {
    label?: string | null
    url?: string | null
    type?: string | null
  } | null
} | null

export const LinkGroupRowLabel: React.FC<RowLabelProps> = () => {
  const row = useRowLabel<LinkGroupRowData>()
  const rowNumber = row?.rowNumber

  const label =
    row?.data?.link?.label || row?.data?.link?.url || (row?.data?.link?.type ? `(${row.data.link.type})` : 'Row')

  return <div>{`Link ${rowNumber !== undefined ? rowNumber + 1 : ''}: ${label}`}</div>
}

type ContentColumnRowData = {
  size?: string | null
  enableLink?: boolean | null
  link?: {
    label?: string | null
    url?: string | null
  } | null
} | null

export const ContentColumnRowLabel: React.FC<RowLabelProps> = () => {
  const row = useRowLabel<ContentColumnRowData>()
  const rowNumber = row?.rowNumber

  const size = row?.data?.size ? String(row.data.size) : 'column'
  const linkLabel = row?.data?.enableLink ? row?.data?.link?.label || row?.data?.link?.url : null

  const suffix = linkLabel ? ` → ${linkLabel}` : ''

  return <div>{`Column ${rowNumber !== undefined ? rowNumber + 1 : ''}: ${size}${suffix}`}</div>
}


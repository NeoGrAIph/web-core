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

type PopulatedAuthorRowData = {
  name?: string | null
  id?: string | null
} | null

export const PopulatedAuthorRowLabel: React.FC<RowLabelProps> = () => {
  const row = useRowLabel<PopulatedAuthorRowData>()
  const rowNumber = row?.rowNumber

  const label = row?.data?.name || row?.data?.id || 'Row'

  return <div>{`Author ${rowNumber !== undefined ? rowNumber + 1 : ''}: ${label}`}</div>
}

type SearchCategoryRowData = {
  title?: string | null
  relationTo?: string | null
  categoryID?: string | null
} | null

export const SearchCategoryRowLabel: React.FC<RowLabelProps> = () => {
  const row = useRowLabel<SearchCategoryRowData>()
  const rowNumber = row?.rowNumber

  const label = row?.data?.title || row?.data?.categoryID || row?.data?.relationTo || 'Row'

  return <div>{`Category ${rowNumber !== undefined ? rowNumber + 1 : ''}: ${label}`}</div>
}

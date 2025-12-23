'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const AdminBar = dynamic(() => import('@/admin-ui/AdminBar').then((mod) => mod.AdminBar), {
  ssr: false,
})

export function AdminBarGate({ enabled, preview }: { enabled: boolean; preview?: boolean }) {
  if (!enabled) return null

  return <AdminBar adminBarProps={{ preview }} />
}

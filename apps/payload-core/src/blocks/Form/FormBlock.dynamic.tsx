'use client'

import dynamic from 'next/dynamic'
import React from 'react'

export const FormBlockDynamic = dynamic(
  () => import('./Component').then((mod) => mod.FormBlock),
  {
    ssr: false,
    loading: () => (
      <div className="container lg:max-w-[48rem]">
        <div className="rounded-[0.8rem] border border-border p-4 lg:p-6">
          <p className="text-sm text-muted-foreground">Loading form...</p>
        </div>
      </div>
    ),
  },
)

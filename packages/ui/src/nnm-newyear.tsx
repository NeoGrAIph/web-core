'use client'

import React, { useEffect } from 'react'

type NnmNewYearProps = {
  assetsBase?: string
  className?: string
}

const defaultAssetsBase = '/nnmstatic'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}

export function NnmNewYear({ assetsBase = defaultAssetsBase, className }: NnmNewYearProps) {
  useEffect(() => {
    const styleId = 'nnm-newyear-style'
    if (!document.getElementById(styleId)) {
      const link = document.createElement('link')
      link.id = styleId
      link.rel = 'stylesheet'
      link.href = `${assetsBase}/forum/new_year/style2022.css`
      if (className) link.className = className
      document.head.appendChild(link)
    }

    // Ensure ASSETS is set for the legacy script
    ;(window as unknown as { ASSETS?: string }).ASSETS = assetsBase

    const originalWrite = document.write.bind(document)
    document.write = (html: string) => {
      const container = document.createElement('div')
      container.innerHTML = html
      if (container.firstChild) {
        document.body.prepend(container.firstChild)
      }
    }

    const jquery = `${assetsBase}/forum/misc/js/jquery-3.4.0.min.js`
    const migrate = `${assetsBase}/forum/misc/js/jquery-migrate-3.0.1.min.js`
    const newYear = `${assetsBase}/forum/new_year/newyear2024.js`

    const hasJQ = typeof (window as unknown as { $?: unknown }).$ !== 'undefined'
    const chain = hasJQ ? Promise.resolve() : loadScript(jquery).then(() => loadScript(migrate))

    chain
      .then(() => loadScript(newYear))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err)
      })

    return () => {
      document.write = originalWrite
    }
  }, [assetsBase])

  return null
}

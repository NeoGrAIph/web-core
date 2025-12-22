'use client'

import React, { useEffect } from 'react'

type NnmNewYearProps = {
  assetsBase?: string
  className?: string
}

const defaultAssetsBase = '/nnmstatic'
const styleId = 'nnm-newyear-style'

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
    const anchorId = 'nnm-newyear-anchor'

    if (!document.getElementById(styleId)) {
      const link = document.createElement('link')
      link.id = styleId
      link.rel = 'stylesheet'
      link.href = `${assetsBase}/forum/new_year/style2022.css`
      if (className) link.className = className
      document.head.appendChild(link)
    }

    if (!document.getElementById(anchorId)) {
      const anchor = document.createElement('div')
      anchor.id = anchorId
      anchor.setAttribute('aria-hidden', 'true')
      document.body.prepend(anchor)
    }

    let styleTag = document.getElementById(styleId + '-layout') as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId + '-layout'
      styleTag.textContent = `
        #${anchorId} {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 115px;
          z-index: 10;
          pointer-events: none;
          overflow: visible;
        }
        #${anchorId} .b-page_newyear {
          pointer-events: none;
          z-index: 5 !important;
        }
        #${anchorId} .b-page__content {
          min-height: 0 !important;
          height: 0 !important;
          overflow: visible !important;
        }
        #${anchorId} .b-ball_bounce,
        #${anchorId} .b-ball_bounce *,
        #${anchorId} .b-ball__right {
          pointer-events: auto;
        }
        body {
          padding-top: var(--nnm-newyear-offset, 0px);
        }
      `
      document.head.appendChild(styleTag)
    }

    // Ensure ASSETS is set for the legacy script
    ;(window as unknown as { ASSETS?: string }).ASSETS = assetsBase

    const originalWrite = document.write.bind(document)
    document.write = (html: string) => {
      const container = document.createElement('div')
      container.innerHTML = html
      const anchor = document.getElementById(anchorId)
      if (container.firstChild && anchor) {
        anchor.appendChild(container.firstChild)
      }
    }

    const jquery = `${assetsBase}/forum/misc/js/jquery-3.4.0.min.js`
    const migrate = `${assetsBase}/forum/misc/js/jquery-migrate-3.0.1.min.js`
    const newYear = `${assetsBase}/forum/new_year/newyear2024.js`

    const hasJQ = typeof (window as unknown as { $?: unknown }).$ !== 'undefined'
    const chain = hasJQ ? Promise.resolve() : loadScript(jquery).then(() => loadScript(migrate))

    chain
      .then(() => loadScript(newYear))
      .then(() => {
        const hasBanner = Boolean(document.querySelector('.b-page_newyear'))
        if (hasBanner) {
          document.documentElement.style.setProperty('--nnm-newyear-offset', '75px')
        }
      })
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

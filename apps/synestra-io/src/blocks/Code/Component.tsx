'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const Code = dynamic(() => import('./Component.client').then((mod) => mod.Code), {
  ssr: false,
})

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Code code={code} language={language} />
    </div>
  )
}

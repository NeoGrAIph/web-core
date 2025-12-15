import * as React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        background: '#fff',
        ...style,
      }}
    />
  )
}


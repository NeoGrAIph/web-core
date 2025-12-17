import * as React from 'react'

export type CardVariant = 'surface' | 'muted'

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
}

function joinClassNames(...values: Array<string | undefined>): string | undefined {
  const next = values.filter(Boolean).join(' ')
  return next.length ? next : undefined
}

export function Card({ className, variant = 'surface', ...rest }: CardProps) {
  return (
    <div
      {...rest}
      data-variant={variant === 'surface' ? undefined : variant}
      className={joinClassNames('syn-ui-card', className)}
    />
  )
}

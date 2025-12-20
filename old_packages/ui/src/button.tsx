import * as React from 'react'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'sm' | 'md'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

function joinClassNames(...values: Array<string | undefined>): string | undefined {
  const next = values.filter(Boolean).join(' ')
  return next.length ? next : undefined
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      data-variant={variant}
      data-size={size}
      className={joinClassNames('syn-ui-button', className)}
    >
      {children}
    </button>
  )
}

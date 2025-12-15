'use client'

import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ children, ...rest }: ButtonProps) {
  return <button {...rest}>{children}</button>
}


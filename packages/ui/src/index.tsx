import React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return <button {...rest}>{children}</button>
}

export default {
  Button
}
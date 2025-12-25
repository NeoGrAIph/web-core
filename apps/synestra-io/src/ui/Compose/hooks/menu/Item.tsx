import React, { memo } from 'react'

import type { BaseItemProps } from '../../../../types.js'

import { ArrowIcon } from '../../../Icons/Icons.js'
import styles from './menu.module.scss'

const ItemBase: React.FC<BaseItemProps> = ({ children, disabled, isActive, onClick, ...rest }) => (
  <span
    className={styles.generate_button + ' ' + (isActive ? styles.active : '')}
    data-disabled={disabled}
    onClick={
      !disabled && typeof onClick === 'function'
        ? (onClick as React.MouseEventHandler<HTMLSpanElement>)
        : undefined
    }
    onKeyDown={
      !disabled && typeof onClick === 'function'
        ? (onClick as React.KeyboardEventHandler<HTMLSpanElement>)
        : undefined
    }
    role="presentation"
    {...rest}
  >
    {children}
  </span>
)

export const Item: React.FC<BaseItemProps> = memo(ItemBase)
Item.displayName = 'AiComposeMenuItem'

export const createMenuItem = (
  IconComponent: React.ComponentType<{ size?: number }>,
  initialText: string,
) => {
  const MenuItem: React.FC<BaseItemProps> = memo(
    ({ children, disabled, hideIcon, isMenu, onClick, ...rest }) => (
      <Item disabled={disabled} onClick={onClick} {...rest}>
        {hideIcon || <IconComponent size={18} />}
        {children || <span className={styles.text}>{initialText}</span>}
        {isMenu && <ArrowIcon size={18} />}
      </Item>
    ),
  )
  MenuItem.displayName = `AiComposeMenuItem(${initialText})`
  return MenuItem
}

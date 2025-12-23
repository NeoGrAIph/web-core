'use client'

import React, { useEffect, useState } from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

const THEME_OPTIONS: Array<Theme | 'auto'> = ['auto', 'light', 'dark']

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState<Theme | 'auto'>('auto')

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    if (preference === 'light' || preference === 'dark' || preference === 'auto') {
      setValue(preference)
    }
  }, [])

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent p-1 text-xs">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option}
          className={[
            'rounded-full px-2 py-1 transition',
            value === option ? 'bg-foreground text-background' : 'text-foreground/70',
          ].join(' ')}
          onClick={() => onThemeChange(option)}
          type="button"
        >
          {option === 'auto' ? 'Auto' : option === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  )
}

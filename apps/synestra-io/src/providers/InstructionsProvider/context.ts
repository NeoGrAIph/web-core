'use client'

import type { CollectionSlug, Field } from 'payload'
import type React from 'react';

import { createContext } from 'react'

import type { SerializedPromptField } from '../../types.js'
import type { PluginInstructionsDoc } from '../../plugin-ai-types.js'

type ActiveCollection = CollectionSlug | '' | string

export type InstructionsContextValue = {
  activeCollection?: ActiveCollection
  debugging?: boolean
  enabledLanguages?: string[]
  field?: Field
  hasInstructions: boolean
  instructions: Record<string, PluginInstructionsDoc>
  isConfigAllowed: boolean
  path?: string
  promptFields: SerializedPromptField[]
  schemaPath?: unknown
  setActiveCollection?: React.Dispatch<React.SetStateAction<ActiveCollection>>
}

export const initialContext: InstructionsContextValue = {
  debugging: false,
  field: undefined,
  hasInstructions: false,
  instructions: {},
  isConfigAllowed: true,
  path: '',
  promptFields: [],
  schemaPath: '',
}

export const InstructionsContext = createContext<InstructionsContextValue>(initialContext)

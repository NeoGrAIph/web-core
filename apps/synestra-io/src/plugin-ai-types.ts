export type PluginInstructionsDoc = {
  [key: string]: unknown
  id: number | string
  'schema-path': string
  'field-type'?: string
  'relation-to'?: string
  'model-id'?: string
  disabled?: boolean
  layout?: string
  prompt?: string
  system?: string
  images?: Array<{
    image?: number | string
  }>
  createdAt?: string
  updatedAt?: string
}

export type PluginInstructionsData = Omit<
  PluginInstructionsDoc,
  'id' | 'createdAt' | 'updatedAt'
>

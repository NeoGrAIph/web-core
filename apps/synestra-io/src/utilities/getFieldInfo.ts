import type { BasePayload } from 'payload'

import { getFieldBySchemaPath } from './getFieldBySchemaPath.js'

export const getFieldInfo = (collections: BasePayload['collections'], schemaPath: string) => {
  let fieldInfo = null
  //TODO: Only run below for enabled collections
  for (const collection of Object.values(collections)) {
    fieldInfo = getFieldBySchemaPath(collection.config, schemaPath)
    if (fieldInfo) {
      return fieldInfo
    }
  }
}

import type { Endpoint, PayloadRequest } from 'payload'

import type { PluginConfig, SerializedPromptField } from '../types.js'

import { PLUGIN_FETCH_FIELDS_ENDPOINT, PLUGIN_INSTRUCTIONS_COLLECTION } from '../defaults.js'

export const fetchFields: (config: PluginConfig) => Endpoint = (config) => {
  const { access, options = {}, promptFields = [] } = config
  return {
    handler: async (req: PayloadRequest) => {
      const { docs = [] } = await req.payload.find({
        collection: PLUGIN_INSTRUCTIONS_COLLECTION,
        pagination: false,
      })

      let isConfigAllowed = true // Users allowed to update prompts by default

      if (access?.settings) {
        try {
          isConfigAllowed = await access.settings({ req })
        } catch (e) {
          req.payload.logger.error(req, 'Please check your "access.settings" for request')
        }
      }

      const fieldMap: Record<string, { disabled?: boolean; fieldType: any; id: any }> = {}
      docs.forEach((doc) => {
        const record = doc as unknown as Record<string, unknown>
        const schemaPath = record['schema-path']
        if (typeof schemaPath !== 'string' || schemaPath.length === 0) return

        fieldMap[schemaPath] = {
          id: doc.id,
          disabled: !!record['disabled'],
          fieldType: record['field-type'],
        }
      })

      return Response.json({
        ...options,
        debugging: config.debugging,
        fields: fieldMap,
        isConfigAllowed,
        promptFields: promptFields.map(({ getter: _getter, ...field }): SerializedPromptField => {
          return field
        }),
      })
    },
    method: 'get',
    path: PLUGIN_FETCH_FIELDS_ENDPOINT,
  }
}

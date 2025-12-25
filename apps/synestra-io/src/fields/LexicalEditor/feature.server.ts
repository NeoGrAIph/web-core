import { createServerFeature } from '@payloadcms/richtext-lexical'

import { PLUGIN_LEXICAL_EDITOR_FEATURE } from '../../defaults.js'

// TODO: Find a way to check if the plugin is activated
export const PayloadAiPluginLexicalEditorFeature = createServerFeature({
  feature: {
    ClientFeature: '@/fields/LexicalEditor/feature.client#LexicalEditorFeatureClient',
  },
  key: PLUGIN_LEXICAL_EDITOR_FEATURE,
})

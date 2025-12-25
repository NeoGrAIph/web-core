import type { Config } from './payload-types'
import type { PluginInstructionsDoc } from './plugin-ai-types'

declare module 'payload' {
  export interface GeneratedTypes extends Config {
    collections: Config['collections'] & {
      'plugin-ai-instructions': PluginInstructionsDoc
    }
  }
}

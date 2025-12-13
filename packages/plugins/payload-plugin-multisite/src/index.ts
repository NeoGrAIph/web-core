import type { Config } from 'payload'

export type MultisitePluginOptions = {
  // define any options for your multisite plugin here
}

export const multisitePlugin = (options: MultisitePluginOptions = {}) => {
  return (config: Config): Config => {
    // currently, this plugin does not modify the config
    // in a real implementation, you would extend collections, globals, hooks, etc. here
    return config
  }
}

export default multisitePlugin
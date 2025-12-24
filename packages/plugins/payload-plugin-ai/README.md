# @synestra/payload-plugin-ai

Internal vendored copy of the Payload AI plugin from
`upstream/payload/templates/payload-ai` (reference-only).

## Purpose
- Provide AI-assisted content generation in Payload admin (Compose actions).
- Keep a controllable, syncable copy inside web-core for easier updates.

## Exports
- `@synestra/payload-plugin-ai` (plugin factory, default prompts)
- `@synestra/payload-plugin-ai/client` (InstructionsProvider, Lexical client feature)
- `@synestra/payload-plugin-ai/fields` (ComposeField, PromptEditorField, SelectField)
- `@synestra/payload-plugin-ai/types`

## Usage (app)
1. Add to `payload.config.ts` plugins array:
   ```ts
   import { payloadAiPlugin } from '@synestra/payload-plugin-ai'

   export default buildConfig({
     plugins: [
       payloadAiPlugin({
         collections: {
           [Posts.slug]: true,
         },
       }),
     ],
   })
   ```
2. Enable the Lexical feature on richText editors:
   ```ts
   import { PayloadAiPluginLexicalEditorFeature } from '@synestra/payload-plugin-ai'
   ```
3. Regenerate import map if needed:
   ```bash
   payload generate:importmap
   ```

## Environment keys
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `ELEVENLABS_API_KEY`
- Optional: `OPENAI_BASE_URL`, `OPENAI_ORG_ID`

The plugin is activated only when at least one provider key is present.

## Sync notes
- Upstream source: `upstream/payload/templates/payload-ai/src` (read-only).
- During sync, all `@ai-stack/payloadcms/*` references are rewritten to
  `@synestra/payload-plugin-ai/*` to match our package naming.
- Helper script: `scripts/sync-upstream-payload-ai.sh`.

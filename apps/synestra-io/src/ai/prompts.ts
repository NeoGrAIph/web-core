import type { ActionPrompt, SeedPromptFunction } from '../types.js'

//TODO: This is a temporary solution make use of structured output
export const defaultSystemPrompt = `IMPORTANT INSTRUCTION:
Produce only the requested output text.
Do not add any explanations, comments, or engagement.
Do not use quotation marks in the response.
BEGIN OUTPUT:`

export const defaultPrompts: ActionPrompt[] = [
  {
    name: 'Rephrase',
    system: ({
      prompt = '',
      systemPrompt = '',
    }) => `You are a skilled language expert. Rephrase the given text while maintaining its original meaning, tone, and emotional content. Use different words and sentence structures where possible, but preserve the overall style and sentiment of the original.
      
      -------------
      ИНСТРУКЦИИ:
      - Перефразируй текст в соответствии с руководством ИСХОДНОГО SYSTEM PROMPT, если он указан.
      - Сохрани исходный смысл, тон и эмоциональную окраску.
      - Используй другую лексику и структуры предложений там, где это уместно.
      - Убедись, что перефразированный текст передаёт то же сообщение и чувство, что и оригинал.
      ${prompt ? '\n\nPrevious prompt:\n' + prompt : ''}
      ${systemPrompt ? '\n\nORIGINAL SYSTEM PROMPT:\n' + systemPrompt : ''}
      -------------`,
  },
  {
    name: 'Expand',
    system:
      () => `You are a creative writer and subject matter expert. Expand the given text by adding depth, detail, and relevant information while maintaining the original tone and style.
      
      -------------
      ИНСТРУКЦИИ:
      - Пойми основные идеи и тон текста.
      - Добавь детали, примеры, объяснения или контекст.
      - Сохрани исходный тон, стиль и намерение.
      - Убедись, что расширенная версия звучит естественно и связно.
      - Не противоречь и не меняй исходный смысл.
      -------------`,
  },
  {
    name: 'Proofread',
    system:
      () => `You are an English language expert. Proofread the given text, focusing on correcting grammar and spelling mistakes without altering the content, style, or tone.
      
      -------------
      ИНСТРУКЦИИ:
      - Исправляй грамматические и орфографические ошибки.
      - Не меняй содержание, смысл, тон или стиль.
      - Верни весь текст — независимо от того, были ли исправления.
      - Не добавляй комментариев или анализа.
      -------------`,
  },
  {
    name: 'Simplify',
    system: ({
      prompt = '',
    }) => `You are a skilled communicator specializing in clear and concise writing. Simplify the given text to make it easier to understand while retaining its core message.
      
      -------------
      ИНСТРУКЦИИ:
      - Упрости язык, используя более распространённые слова и короткие предложения.
      - Убери лишние детали или жаргон, сохранив необходимую информацию.
      - Сохрани исходный смысл и ключевые пункты.
      - Стремись к ясности и читабельности для широкой аудитории.
      - Упрощённый текст должен быть короче оригинала.
      ${prompt ? '\n\nPREVIOUS PROMPT:\n' + prompt : ''}
      -------------`,
  },
  {
    name: 'Summarize',
    layout: () => `
[heading] - Summary
[paragraph] - Your summary goes here...
    `,
    system: () =>
      `You are an expert at summarizing information. Your task is to create a concise summary of the given text that captures its key points and essential details while preserving the original meaning.

INSTRUCTIONS:
1. Carefully read and analyze the provided text.
2. Identify and extract the main ideas and crucial supporting details.
3. Condense the information into a clear and coherent summary that maintains the core message.
4. Preserve the original tone and intent of the text.
5. Ensure your summary is approximately 25-30% of the original text length.
6. Use clear and precise language, avoiding unnecessary jargon or complexity.
`,
  },
  {
    name: 'Tone',
    system: () =>
      `You are a tone adjustment specialist. Modify the tone of the given text as specified while keeping the original message and content intact.
      
      -------------
      ИНСТРУКЦИИ:
      - Подстрой тон под указанный стиль (например, формальный, неформальный, профессиональный, дружелюбный).
      - Сохрани исходное содержание и смысл.
      - Убедись, что текст звучит естественно в новом тоне.
      -------------`,
  },
  {
    name: 'Translate',
    system: ({ locale, prompt = '', systemPrompt = '' }) =>
      `You are a skilled translator. Translate the following text into ${locale}, ensuring the original meaning, tone, and context are preserved.
    
    -------------
    ИНСТРУКЦИИ:
    - Точно переведи текст на ${locale}.
    - Сохрани исходный смысл, тон и контекст.
    - Убедись, что перевод культурно уместен и естественно звучит на целевом языке.
    ${prompt ? '\n\nPREVIOUS PROMPT:\n' + prompt : ''}
    ${systemPrompt ? '\n\nORIGINAL SYSTEM PROMPT:\n' + systemPrompt : ''}
    -------------`,
  },
]

export const defaultSeedPrompts: SeedPromptFunction = ({
  fieldLabel,
  fieldSchemaPaths,
  fieldType,
  path,
}: {
  fieldLabel: string
  fieldSchemaPaths: any
  fieldType: string
  path: string
}) => {
  return {
    prompt: `field-type: ${fieldType}
field-name: ${fieldLabel}
schema-path: ${path}

Give me a prompt that relate to the given field type and schema path.

Generated prompt:
`,
    system: `# AI Assistant for CMS Prompt Generation

Your role: Generate prompts for Content Management System (CMS) fields based on field-type and schema-path.

## Key Guidelines:
- Tailor prompts to specific field-type and purpose
- Use schema-path for context
- Include " {{ title }} " in every prompt
- Be clear, concise, and instructive
- Focus on content generation, not user perspective
- For Image, Voice, or Banner fields, use provided example prompts verbatim
- Image, Banner prompt MUST NOT CONTAIN ANY TYPOGRAPHY/TEXT DETAILS

## Field Types and Prompts:

1. richText:
   - Craft detailed, structured content
   - Include intro, sections, body, formatting, and conclusion
   - Aim for engaging, informative, and valuable content

2. text:
   - For titles: Generate concise, engaging titles
   - For keywords: List relevant SEO terms

3. textarea:
   - Provide comprehensive details (e.g., event information)

4. upload:
   - Describe high-quality images or media

## Schema-path Examples:
- posts.title: Blog/article title
- products.name: Product name

## Must Follow:
- Adapt prompts to schema-path context
- Generate content directly, avoid personal pronouns
- Use provided examples as guidelines

### Examples for each field type along with generated prompt:

For richText:
  field-type: richText
  field-name: Content
  schema-path: posts.content
  Generated prompt: Craft compelling content for a blog post with the title " {{ title }} ". Develop a well-structured narrative that captivates readers from start to finish. Incorporate the following elements to create a polished and engaging piece:

- Engaging introduction that hooks the reader
- Clearly defined sections with relevant subheadings
- Well-researched and informative body paragraphs
- Creative use of formatting to enhance readability (e.g., bullet points, blockquotes, italics, headings, bolds, other text formats)
- Compelling conclusion that reinforces the main theme
- Make the format easily digestible and clear for enhanced readability and improved CTR. 
- The user should be engaged, consistently interested, and feel that they’ve gained the knowledge they were seeking. 

Infuse the content with your expertise and a touch of personality to make it both informative and enjoyable to read. Aim to provide value to your target audience while maintaining a professional tone that aligns with the blog's overall style.
Feel free to incorporate relevant anecdotes, statistics, or examples to support your points and add depth to the post. Remember, the goal is to create content that not only informs but also inspires and entertains your readers.

For text:
  field-type: text
  field-name: title
  schema-path: posts.title
  Generated prompt: Generate a captivating title for the blog post based on " {{ title }} " that effectively encapsulates the main theme and draws in readers. The title should be concise, engaging, and relevant to the content being presented. If no input is provided then generate creative title.

For text:
  field-type: text
  field-name: keywords
  schema-path: posts.keywords
  Generated prompt: Identify and list relevant keywords for the blog post titled " {{ title }} ". Focus on terms that enhance search engine optimization and accurately reflect the main themes and topics of the content.
keywords will with comma separated.


For textarea:
  field-type: textarea:
  field-name: details
  schema-path: posts.details
  Generated prompt: Provide comprehensive details for the event " {{ title }} ". Include essential information such as date, time, location, and any specific instructions or requirements.

For upload:
  field-type: upload
  field-name: Featured Image
  schema-path: posts.image
  Generated prompt: Imagine {{ title }}

For upload:
  field-type: upload
  field-name: Voice
  schema-path: posts.upload
  Generated prompt: {{ title }} {{ toHTML [provide schema-path here...] }}


Remember to adapt the prompts based on the specific schema-path provided, considering the context and purpose of the field within the CMS structure. The prompts should directly instruct the AI model on what content to generate or describe, without assuming a user perspective.

Schema Map Context:
${JSON.stringify(fieldSchemaPaths)}

${defaultSystemPrompt}
`,
  }
}

import sharedConfig from '@synestra/eslint-config'

export default [
  ...sharedConfig,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@synestra/ui',
              message:
                "Root barrel запрещён: используй subpath exports ('@synestra/ui/<component>') только внутри '@/ui/*' фасада.",
            },
          ],
          patterns: [
            {
              group: ['@/components/ui/*'],
              message:
                "В app-коде импортируй UI только через фасад '@/ui/*' (для file-overrides).",
            },
            {
              group: ['@/admin-ui/*'],
              message:
                "Admin UI не смешиваем с frontend: используем '@/admin-ui/*' только в Payload Admin кастомизациях.",
            },
            {
              group: ['@synestra/ui/*'],
              message:
                "В app-коде не импортируй shared UI напрямую: используй фасад '@/ui/*'.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/app/(frontend)/**/*.{js,jsx,ts,tsx}',
      'src/blocks/**/*.{js,jsx,ts,tsx}',
      'src/heros/**/*.{js,jsx,ts,tsx}',
      'src/providers/**/*.{js,jsx,ts,tsx}',
      'src/search/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/admin-ui/*'],
              message:
                "Frontend не должен зависеть от admin UI. Используй '@/ui/*' или локальные компоненты frontend.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/admin-ui/**/*.{js,jsx,ts,tsx}', 'src/app/(payload)/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*'],
              message:
                "Payload Admin кастомизации не должны зависеть от frontend фасада '@/ui/*'. Используй '@payloadcms/ui/*' или '@/admin-ui/*'.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@synestra/ui',
              message: "Root barrel запрещён: используй '@synestra/ui/<component>'.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]

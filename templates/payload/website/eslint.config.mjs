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

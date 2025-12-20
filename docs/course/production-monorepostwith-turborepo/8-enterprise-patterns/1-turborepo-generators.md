source: https://vercel.com/academy/production-monorepos/turborepo-generators
# [Turborepo generators](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#turborepo-generators)

Creating new components means copying boilerplate: imports, types, tests, exports. In large teams, this leads to inconsistency and mistakes. Turborepo generators automate component and package creation with templates, ensuring every component follows team standards.

## [Outcome](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#outcome)

Create generators that scaffold new components and packages automatically.

## [Fast track](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#fast-track)

1. Install @turbo/gen
2. Create generator config
3. Define component generator
4. Run and test generator

## [Hands-on exercise 9.1](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#hands-on-exercise-91)

### [1. Install dependencies](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#1-install-dependencies)

```
pnpm add -D @turbo/gen
```

### [2. Create generator config](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#2-create-generator-config)

Create `turbo/generators/config.ts`:

turbo/generators/config.ts

```
import type { PlopTypes } from '@turbo/gen'
 
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // TODO: Add component generator with:
  //   - name: 'component'
  //   - description: 'Create a new UI component'
  //   - prompts: ask for component name
  //   - actions: create component file, test file, export
}
```

### Solution

turbo/generators/config.ts
```
import type { PlopTypes } from '@turbo/gen'
 
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('component', {
    description: 'Create a new UI component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., Input):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{turboRoot}}/packages/ui/src/{{kebabCase name}}.tsx',
        templateFile: 'templates/component.hbs',
      },
      {
        type: 'add',
        path: '{{turboRoot}}/packages/ui/src/{{kebabCase name}}.test.tsx',
        templateFile: 'templates/component-test.hbs',
      },
      {
        type: 'append',
        path: '{{turboRoot}}/packages/ui/src/index.ts',
        template: "export * from './{{kebabCase name}}'",
      },
    ],
  })
}
```

### [3. Create templates](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#3-create-templates)

Create `turbo/generators/templates/component.hbs`:

```
interface {{pascalCase name}}Props {
  children?: React.ReactNode
  className?: string
}
 
export function {{pascalCase name}}({ children, className = '' }: {{pascalCase name}}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
```

Create `turbo/generators/templates/component-test.hbs`:

```
import { render, screen } from '@testing-library/react'
import { {{pascalCase name}} } from './{{kebabCase name}}'
 
describe('{{pascalCase name}} component', () => {
  it('renders children', () => {
    render(<{{pascalCase name}}>Test content</{{pascalCase name}}>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
```

## [Run generator](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#run-generator)

### [1. Generate component](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#1-generate-component)

```
turbo gen component
```

Prompts:

```
? Component name (e.g., Input): Input
```

Output:

```
✔ Created packages/ui/src/input.tsx
✔ Created packages/ui/src/input.test.tsx
✔ Updated packages/ui/src/index.ts
```

### [2. Verify generated files](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#2-verify-generated-files)

Check `packages/ui/src/input.tsx`:

```
interface InputProps {
  children?: React.ReactNode
  className?: string
}
 
export function Input({ children, className = '' }: InputProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
```

Perfect boilerplate generated!

### [3. Run tests](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#3-run-tests)

```
pnpm --filter @geniusgarage/ui test
```

Output:

```
✓ src/input.test.tsx (1)
  ✓ Input component (1)
    ✓ renders children

Tests  15 passed (15)
```

Generated test works!

## [Add package generator](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#add-package-generator)

Add to `turbo/generators/config.ts`:

```
plop.setGenerator('package', {
  description: 'Create a new shared package',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Package name (e.g., db):',
    },
  ],
  actions: [
    {
      type: 'addMany',
      destination: '{{turboRoot}}/packages/{{name}}',
      base: 'templates/package',
      templateFiles: 'templates/package/**',
    },
  ],
})
```

Create template structure:

```
  turbo/generators/templates/package/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │   └── index.ts
  └── README.md
```

Run:

```
turbo gen package
? Package name: db
✔ Created packages/db
```

## [Benefits](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#benefits)

**Before generators:**

- Copy-paste component
- Forget to add export
- Inconsistent naming
- Missing tests

**With generators:**

- `turbo gen component`
- Consistent structure
- Tests included
- Auto-exported

**For 10-person team:**

- 100+ components created
- Zero boilerplate errors
- Enforced standards

## [Done-when](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#done-when)

Verify generators work:

- [ ] Installed @turbo/gen
- [ ] Created turbo/generators/config.ts
- [ ] Defined component generator
- [ ] Created component and test templates
- [ ] Ran `turbo gen component` and created Input
- [ ] Verified generated files are correct
- [ ] Ran tests and saw generated test pass
- [ ] (Optional) Created package generator
- [ ] Understood generators enforce consistency

## [What's Next](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/1-turborepo-generators.md#whats-next)

Generators automate creation, but how do you version packages? Next lesson: **Changesets** - learn to manage versions, generate changelogs, and publish packages to npm with semantic versioning.

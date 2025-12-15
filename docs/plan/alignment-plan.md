# План выравнивания `web-core` с рекомендациями курса (alignment plan)

Дата: **2025-12-14**.

Цель — привести `web-core` к максимально “production‑готовому” состоянию по best practices курса `Production Monorepos with Turborepo`, адаптированным под self-host/k3s/ArgoCD, при этом сохранив:

- dev-first (быстро показываем результат в `dev`);
- независимые деплои (по app/deployment);
- отсутствие plaintext‑секретов в репозитории;
- лёгкую интеграцию новых Payload templates.

Связанные документы:

- Рекомендации по урокам: `docs/course/production-monorepostwith-turborepo/recommendations.md`
- Текущее состояние: `docs/audit/current-state.md`
- Примечание: в сохранённом курсе отсутствует секция про env vars (анонсирована, но нет материалов) — стратегию env для `web-core` формируем отдельно на базе `docs/research/templates-*` и наших ограничений.

---

## Backlog: изменения → эффект → риск → миграция

### Quick wins (низкий риск)

| Изменение | Эффект | Риск | Миграция |
|---|---|---|---|
| Ввести базовый CI workflow (пример) для `pnpm install` + `pnpm build/lint/test` | Быстрый feedback, меньше ручных регрессий | Низкий | Добавить `.github/workflows/ci.yml` как reference; при необходимости адаптировать под GitLab в `synestra-platform` |
| Добавить тестовый контур для `packages/ui` (Vitest + RTL + jsdom) | Проверяемость shared UI, подготовка к “test caching” в turbo | Низкий/средний | Добавить devDeps и `scripts.test` в `@synestra/ui`, настроить `turbo test` |
| Определить “public API” для `@synestra/ui` (subpath exports vs root export) | Единые импорты, предсказуемое масштабирование UI | Низкий | Зафиксировать решение в `packages/ui/package.json` и `packages/ui/README.md`, затем единообразно применять в apps |
| Добавить runbook “как добавить новый app из Payload template” | Ускорение интеграции новых шаблонов, снижение расхождений | Низкий | Документировать шаги: upstream → apps/* → выделение общего в packages/* |
| Дополнить `.gitignore` типовыми editor‑артефактами (`*.swp`, и т.п.) | Меньше мусора/случайных файлов в репо | Низкий | Одноразовая правка `.gitignore` |

### Structural changes (средний риск)

| Изменение | Эффект | Риск | Миграция |
|---|---|---|---|
| Унифицировать TS/ESLint конфиги: использовать `packages/typescript-config` и `packages/eslint-config` как единственный источник | Меньше дрейфа конфигов, проще добавлять новые apps | Средний | По очереди перевести `apps/*` и `packages/*` на `extends`/shared config, проверить `pnpm build` |
| Ввести “шаблон app” (минимальный набор файлов/скриптов/портов) | Быстрый старт новых apps, меньше ручной рутины | Средний | Добавить docs + (опционально) turbo generators позже |
| Стандартизировать `turbo.json` pipeline под build/lint/test/typecheck | Предсказуемые задачи, корректное кеширование | Средний | Добавлять задачи итеративно; проверять `turbo --dry-run` |

### Runtime / production patterns (средний/высокий риск)

| Изменение | Эффект | Риск | Миграция |
|---|---|---|---|
| Закрепить паттерн миграций Payload в k8s (Job hook vs initContainer) | Детерминированный деплой, меньше “случайных” сбоев | Средний | Начать с dev: ArgoCD PreSync Job (уже есть в chart), затем доработать под stage/prod |
| Определить storage для uploads (`public/media`): PVC vs S3 | Готовность к прод‑эксплуатации | Высокий | Dev: PVC; stage/prod: оценить S3‑адаптер и требования |
| Прописать требования для preview/live preview (secrets, ingress logging) | Безопасность и функциональность preview | Средний | Документировать контракт и ограничения (не логировать querystring; routing) |

### CI/CD + k8s deployment (средний риск, интеграция с `synestra-platform`)

| Изменение | Эффект | Риск | Миграция |
|---|---|---|---|
| Описать remote caching Turborepo для self-host CI (варианты) | Существенное ускорение CI | Средний | Документация + переменные окружения; реализация/секреты в `synestra-platform` |
| Сформировать “контракт промоушена” dev → stage → prod | Управляемые релизы без ручного хаоса | Средний | Заложить структуру `deploy/env/{dev,stage,prod}` и правила изменения image tag |
| Описать стандарт “один deployment = namespace + DB” | Изоляция и безопасность | Средний | Следовать существующему шаблону chart; расширять аккуратно (без cluster-level ресурсов) |

---

## Этапность (предлагаемо)

1) Quick wins: CI, тесты для `@synestra/ui`, runbooks, `.gitignore`.
2) Structural: выравнивание shared configs + turbo pipeline.
3) Runtime: storage/migrations/preview patterns.
4) CI/CD + GitOps: remote cache + promotion dev→stage→prod (в связке с `synestra-platform`).

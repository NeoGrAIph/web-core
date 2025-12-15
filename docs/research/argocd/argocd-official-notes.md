# Argo CD — конспект официальной документации (для Synestra)

Дата актуальности: **2025-12-15**.  
Версия Argo CD в нашем кластере: **v3.2.0** (проверено командой `argocd version --grpc-web`).

Цель: зафиксировать, как **в официальной документации Argo CD** предлагается решать задачи, которые у нас уже возникли/появятся при связке:
- `web-core` (монорепа приложений/values/ArgoCD Applications),
- `synestra-platform` (платформенные приложения, секреты, Argo CD, Traefik, cert-manager, Okteto),
- dev‑режим “поверх” GitOps‑деплоя (Okteto ↔ Argo CD),
- dev/prod‑поток (image tag → Git → ArgoCD автодоставка),
- hooks/миграции, diff/ignore, sync options, app-of-apps и масштабирование монорепы.

Важно: это **конспект**, а не “как мы делаем”. Практическое “как мы делаем” фиксируется в runbooks. Здесь мы:
1) собираем официальные механики,
2) отмечаем, где они совпадают/расходятся с нашим подходом,
3) формируем список “что проверить/решить” для нашей реализации.

---

## 1) Источники (официальные страницы Argo CD)

Ниже перечислены страницы, которые прямо соответствуют нашим темам.

**Bootstrapping / app-of-apps / directory**
- Cluster Bootstrapping (App of Apps): `https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/`
- Directory apps (recurse/include/exclude/skip-file-rendering): `https://argo-cd.readthedocs.io/en/stable/user-guide/directory/`

**Генерация Applications (масштабирование монорепы)**
- ApplicationSet (operator manual): `https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/`

**Sync/политики/опции**
- Automated Sync Policy: `https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/`
- Sync Options: `https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/`
- Selective Sync: `https://argo-cd.readthedocs.io/en/stable/user-guide/selective_sync/`
- Sync Phases and Waves: `https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/`
- Sync Windows: `https://argo-cd.readthedocs.io/en/stable/user-guide/sync_windows/`

**Diff/ignore/compare**
- Diff Customization: `https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/`
- Compare Options: `https://argo-cd.readthedocs.io/en/stable/user-guide/compare-options/`

**Project/изоляция/наблюдаемость**
- Projects (AppProject): `https://argo-cd.readthedocs.io/en/stable/user-guide/projects/`
- Orphaned Resources Monitoring: `https://argo-cd.readthedocs.io/en/stable/user-guide/orphaned-resources/`
- RBAC (operator manual): `https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/`

**Tracking / аннотации**
- Resource Tracking: `https://argo-cd.readthedocs.io/en/stable/user-guide/resource_tracking/`
- Annotations and Labels used by Argo CD: `https://argo-cd.readthedocs.io/en/stable/user-guide/annotations-and-labels/`

**Repo credentials / declarative**
- Declarative Setup (repos/credentials templates): `https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/`
- Private Repositories: `https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/`

**Пауза reconcile (альтернатива для специальных кейсов)**
- Skip Application Reconcile: `https://argo-cd.readthedocs.io/en/stable/user-guide/skip_reconcile/`

**Раздельные источники (код отдельно от values)**
- Multiple Sources for an Application: `https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/`

**Масштабирование и оптимизация**
- High Availability (включая manifest cache и `manifest-generate-paths`): `https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/`
- Reconcile Optimization: `https://argo-cd.readthedocs.io/en/stable/operator-manual/reconcile/`

**Best Practices**
- Best Practices: `https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/`

---

## 2) App-of-Apps: официальный паттерн и его “цена”

### 2.1. Что рекомендует Argo CD

Официально Argo CD описывает “app-of-apps” как типичный путь bootstrapping’а: один “родительский” Application, который содержит только манифесты дочерних Applications.

### 2.2. Важное предупреждение (security)

В официальной доке есть явное предупреждение: **App of Apps — admin-only tool**.

Смысл: если кто-то может менять git‑репозиторий родительского приложения, он потенциально может:
- создавать Applications в произвольных AppProject,
- расширять доступы через `project:`/destinations,
- фактически получить “почти админский” контроль.

Практический вывод для нас:
- репозиторий, из которого применяется root app (`apps-web-core`), должен быть под контролем админов платформы (review/branch protection).
- это напрямую касается `synestra-platform/argocd/apps/apps-web-core.yaml` (root app для `web-core`).

### 2.3. Diff/ignore для child apps внутри app-of-apps

Официальная дока показывает, что для child Applications иногда нужно игнорировать различия (например временно отключать autosync для дебага), и приводит пример `ignoreDifferences` для `kind: Application` + `RespectIgnoreDifferences=true`.

Практический вывод:
- если мы хотим разрешать “ручные” изменения child Apps (например временно выключать `selfHeal`/autosync), это можно оформить через `ignoreDifferences` в parent app (но нужно осознанно).

---

## 3) Directory‑applications: include/exclude и `+argocd:skip-file-rendering`

### 3.1. Что это

Directory‑тип приложения грузит plain manifests из `.yml/.yaml/.json`.

Важно: официальная дока предупреждает, что directory‑приложения **работают только для plain manifests**; если ArgoCD встретит Helm/Kustomize/Jsonnet при `directory:` — генерация упадёт.

### 3.2. `recurse`, `include`, `exclude`

Официально:
- `directory.recurse: true` — рекурсивно искать манифесты;
- `directory.include` / `directory.exclude` — glob‑паттерны (можно `{a,b}`).

Практический вывод для нас:
- наш root app `apps-web-core` использует directory с `recurse: true` и `include: '*/synestra-io.yaml'` — это соответствует официальному паттерну “включать только нужные файлы”.

### 3.3. `# +argocd:skip-file-rendering`

Официально: если в репозитории лежат YAML‑файлы, похожие на Kubernetes manifests, но не предназначенные для применения, их можно исключить из парсинга директивой:

```yaml
# +argocd:skip-file-rendering
```

Практический вывод:
- это “официальный” способ не ломать directory‑app на “ложных” YAML;
- для Helm chart `templates/*` это напрямую не применимо (Helm сам рендерит templates), но для directory‑app это полезно.

---

## 4) Automated Sync Policy: как Argo CD официально понимает “автодоставку”

### 4.1. Зачем это нужно (официальная мотивация)

Официальная дока прямо говорит: авто‑sync позволяет **не давать CI доступ** к Argo CD API — вместо этого CI делает commit/push в Git, а Argo CD сам подтягивает изменения.

Это совпадает с нашей целью “релиз = изменение image.tag в git”.

### 4.2. `enabled`, `prune`, `selfHeal`, `allowEmpty`

Официально:
- autosync включается через `spec.syncPolicy.automated` (или `enabled: true`);
- `prune` и `selfHeal` — параметры автоматической политики.

Нюанс, который важен нам для dev:
- если dev допускает временный drift из-за Okteto, `selfHeal` может мешать (будет откатывать изменения).

---

## 5) Sync Options: официальный список “флажков”, которые напрямую влияют на нашу архитектуру

Это самый “плотный” раздел, потому что Okteto интеграция и наши runbooks прямо упираются в syncOptions.

### 5.1. Selective Sync (`ApplyOutOfSyncOnly=true`)

Официально: “selective sync” в autosync режиме позволяет применять только out-of-sync ресурсы, чтобы снижать нагрузку на API server.

Важно (официальное предупреждение на странице Selective Sync):
- selective sync **не записывается** в history (нет rollback),
- **hooks не запускаются**.

Практический вывод:
- для приложений, где миграции критичны (Payload), нужно осторожно относиться к selective sync.
- если мы включим `ApplyOutOfSyncOnly=true`, важно понимать, что hooks (PreSync migrations) при selective sync не будут выполнены — это может быть критично.

### 5.2. `RespectIgnoreDifferences=true`

Официально: по умолчанию `ignoreDifferences` влияет только на сравнение (diff), но во время sync желаемое состояние применяется “как есть”.

С включением `RespectIgnoreDifferences=true` Argo CD учитывает `ignoreDifferences` **также во время sync**.

Практический вывод:
- это ключевой официальный механизм, который может позволить сохранить `selfHeal: true`, но “не трогать” поля, которыми управляет Okteto (или другой инструмент), если мы грамотно настроим `ignoreDifferences`.
- это потенциальная альтернатива простому выключению `selfHeal` в dev.

### 5.3. `CreateNamespace=true` и `ManagedNamespaceMetadata`

Официально:
- `CreateNamespace=true` может создавать namespace автоматически.
- дополнительно можно задавать метаданные namespace через sync option `ManagedNamespaceMetadata` + `spec.syncPolicy.managedNamespaceMetadata`.

Практический вывод:
- у нас namespaces создаются и через `CreateNamespace=true` в web‑apps, и отдельно через SOPS‑манифесты в `synestra-platform`.
- это не обязательно конфликт, но стоит решить “источник истины” для метаданных namespace:
  - либо “namespace создаёт платформа (SOPS) и там же задаются labels/annotations”,
  - либо “namespace создаёт ArgoCD app через CreateNamespace и управляет метаданными”.

### 5.4. `FailOnSharedResource=true`

Официально: заставляет sync падать, если ресурс уже управляется другой Application.

Практический вывод:
- полезно как safety‑rail (например для Ingress host конфликтов),
- но требует аккуратного разделения владения (иначе будет блокировать rollout).

### 5.5. `PruneLast=true`, `PrunePropagationPolicy=...`

Официально:
- `PruneLast=true` — выполнять prune последней “волной” после успешного применения/healthy.
- `PrunePropagationPolicy` — foreground/background/orphan.

Практический вывод:
- это влияет на безопасность удаления ресурсов (и поведение при каскадном удалении).

### 5.6. `Delete=false` / `Prune=false` / `Delete=confirm`

Официально:
- `Delete=false` — не удалять ресурс при удалении приложения,
- `Prune=false` — не prune’ить ресурс,
- `Delete=confirm` — требовать подтверждение на удаление.

Практический вывод:
- для PVC/media и БД‑ресурсов это кандидаты на обсуждение (не удалять автоматически).

### 5.7. `ServerSideApply=true` (+ миграция CSA→SSA)

Официально: можно включить SSA, есть режим миграции managed fields.

Практический вывод:
- если разные контроллеры/операторы “трогают” одни и те же поля, SSA иногда снижает конфликтность.
- но это инфраструктурная настройка, её нужно согласовывать на уровне `synestra-platform`.

---

## 6) Hooks, Sync Phases и Sync Waves: официальный механизм миграций и упорядочивания

### 6.1. Hook types

Официально описаны hook‑типы:
- `PreSync`, `Sync`, `PostSync`, `SyncFail`, `PostDelete`, `Skip`.

Официальный пример прямо включает use-case “db migration как PreSync hook” — это наш случай.

### 6.2. Ordering precedence (важно для стабильных миграций)

Официально Argo CD упорядочивает ресурсы по:
1) phase,
2) wave (argocd.argoproj.io/sync-wave),
3) kind,
4) name.

Есть “wave delay” (по умолчанию 2 секунды) и env `ARGOCD_SYNC_WAVE_DELAY`.

Практический вывод:
- если нужно гарантировать “сначала CNPG Cluster → потом migrations job → потом Deployment”, нужно осознанно расставлять waves (или опираться на kind ordering).

### 6.3. Hook cleanup (`hook-delete-policy`)

Официально:
- есть `HookSucceeded`, `HookFailed`, `BeforeHookCreation` и т.п.

Практический вывод:
- для миграций Payload важно, чтобы hook мог пересоздаваться при каждом sync, и не оставлял приложение “вечно OutOfSync”.

### 6.4. TTL у Jobs и OutOfSync

В официальной документации по hooks (в старых версиях, но всё ещё релевантно как поведение) отмечается, что использование `ttlSecondsAfterFinished` может приводить к OutOfSync, потому что ресурс исчезает после завершения, а в Git он есть.

Практический вывод:
- для миграционных jobs лучше полагаться на `hook-delete-policy`, а не на ttl, если мы хотим избегать “постоянного OutOfSync”.

---

## 7) Diff Customization / ignoreDifferences: как официально “дружить” GitOps и изменения контроллеров

### 7.1. Application-level ignoreDifferences

Официально поддерживаются:
- `jsonPointers` (RFC6902),
- `jqPathExpressions`,
- `managedFieldsManagers` (игнорировать изменения, сделанные определёнными менеджерами).

### 7.2. System-level customization (argocd-cm)

Официально можно задавать `resource.customizations.ignoreDifferences.*` в `argocd-cm`:
- точечно по `group_kind`,
- либо “all” для всех ресурсов.

Также важны `resource.compareoptions`, например:
- `ignoreResourceStatusField: all|crd|none`,
- `ignoreAggregatedRoles: true`,
- настройка таймаута JQ.

Практический вывод (в контексте Okteto):
- если Okteto (или любой другой агент) меняет часть PodSpec/Deployment, то:
  1) можно отключать `selfHeal` в dev (то, что мы сейчас делаем),
  2) либо пытаться оставить `selfHeal`, но настроить `ignoreDifferences` + `RespectIgnoreDifferences=true`, чтобы ArgoCD не перетирал эти поля.

Какой вариант правильнее — нужно решить отдельно и закрепить в runbook (после практического теста).

---

## 8) Compare Options: IgnoreExtraneous

Официально `argocd.argoproj.io/compare-options: IgnoreExtraneous` позволяет не учитывать “лишние” ресурсы в статусе синка (например сгенерированные инструментом).

Практический вывод:
- в namespaces, где будут появляться “вспомогательные” ресурсы от Okteto/Dev‑tools, это может пригодиться, но надо помнить: health всё равно может деградировать.

---

## 9) Resource Tracking: почему это важно именно в нашей связке

Официально Argo CD поддерживает tracking по:
- `annotation` (default) через `argocd.argoproj.io/tracking-id`,
- `annotation+label`,
- `label` (старый/совместимый вариант, `app.kubernetes.io/instance`).

Практический вывод:
- в v3 tracking по annotation — default. Это уменьшает конфликты с Helm/операторами, которые любят писать в `app.kubernetes.io/instance`.
- если нам нужна совместимость с внешними тулзами/дашбордами, можно выбрать `annotation+label` (но это конфиг ArgoCD на уровне `argocd-cm` в `synestra-platform`).

---

## 10) Масштабирование монорепы в Argo CD: `manifest-generate-paths`

Официально Argo CD aggressively кеширует результаты генерации манифестов по SHA репозитория. Это означает: один commit может инвалидировать кеш сразу для всех Applications, которые используют этот repo.

Официальное решение: аннотация Application
`argocd.argoproj.io/manifest-generate-paths` (semicolon-separated list).

Практический вывод для `web-core`:
- это “официальный” способ сделать git-based filtering на стороне Argo CD (не путать с Turborepo filtering в CI).
- в нашем репозитории, где будет много apps, это стоит внедрить как стандарт (в каждом ArgoCD Application указывать релевантные пути: app dir + shared packages + deploy chart).

---

## 11) Reconcile Optimization: игнор churn‑полей и снижение нагрузки

Официально:
- есть механизм `ignoreResourceUpdates` (и флаг `resource.ignoreResourceUpdatesEnabled`),
- можно применять ignore rules для tracked и untracked ресурсов,
- можно “подтягивать” ignore rules из `ignoreDifferences` (через `ignoreDifferencesOnResourceUpdates`).

Практический вывод:
- полезно, если dev‑namespace будет “шумным” (частые изменения status/conditions от controllers/Okteto).
- это конфигурация ArgoCD (в `synestra-platform`), но решения/требования нужно зафиксировать на уровне проекта.

---

## 12) Best Practices (официальные) и как это бьётся с нашим подходом

Официальная рекомендация: разделять “конфиг” (манифесты) и “код” (application source) в разные репозитории.

У нас выбран осознанный компромисс:
- `web-core` хранит и код, и GitOps‑артефакты приложений (для скорости и унификации шаблонов),
- `synestra-platform` хранит инфраструктуру и секреты (изоляция и безопасность).

Риск, который прямо упоминается в официальных best practices:
- CI, который коммитит в тот же repo, может вызвать циклы/шум.

Практический вывод:
- при внедрении “CI обновляет `deploy/env/release/*`” нужно заранее продумать:
  - правила триггеров CI (чтобы релизный коммит не вызывал бесконечный build),
  - ревью/защиту веток,
  - возможно выделение отдельной ветки/репозитория для release‑значений, если шум станет проблемой.

---

## 13) Сопоставление с тем, что у нас уже зафиксировано в Git

### 13.1. Что совпадает с официальными рекомендациями

- app-of-apps + directory include (мы используем `apps-web-core` + `directory.include`).
- Имеем AppProject `synestra-web` и ограничения namespaces → это соответствует идее изоляции через Projects.
- Используем hooks для миграций (PreSync) — это прямо поддерживаемый официальный use-case.
- Включили orphanedResources warn — это официальный механизм обнаружения “сирот”.

### 13.2. Где есть “открытые решения” (нужно выбрать каноничный путь)

1) Dev drift:
   - оставить `selfHeal: false` для dev (простое решение),
   - или включить `selfHeal` и настроить `ignoreDifferences` + `RespectIgnoreDifferences=true` для полей, которые патчит Okteto.

2) Namespaces:
   - “namespace создаёт платформа (SOPS)” vs “CreateNamespace=true и ManagedNamespaceMetadata”.

3) Selective Sync:
   - если включать `ApplyOutOfSyncOnly=true`, нужно проверить влияние на hooks (миграции).

4) `manifest-generate-paths`:
   - определить стандартный набор путей для каждого application в `web-core`.

---

## 14) ApplicationSet: официальный механизм “сгенерировать много Applications”

Официально ApplicationSet controller добавляет CRD `ApplicationSet`, который позволяет:
- генерировать множество `Application` по шаблону (template) + генератору (git/PR/list/matrix/merge/scm provider и т.п.),
- упростить масштабирование в монорепах и на большом количестве окружений/кластеров,
- поддерживать self-service для tenants (с оглядкой на security model).

Практический вывод для `web-core`:
- ApplicationSet может заменить/дополнить наш текущий “directory include + app-of-apps” подход, когда количество сайтов/окружений вырастет.
- Для preview environments (ветка/MR → окружение) это особенно релевантно, потому что Okteto официально предлагает previews через CI, а ApplicationSet умеет PR-генераторы.

Риски/ограничения (официально подчёркивается):
- есть **security implications** ApplicationSet (нельзя давать возможность менять ApplicationSet людям без доверия, иначе можно эскалировать доступы через destinations/projects).

Рекомендация на текущем этапе:
- оставить directory apps для “фиксированных” `web-dev-synestra-io` / `web-synestra-io`,
- параллельно зафиксировать (в отдельном документе) критерии, когда мигрировать на ApplicationSet (количество сайтов, необходимость previews, количество окружений).

---

## 15) Projects (AppProject) и роли: как делегировать права безопасно

Официально AppProject предоставляет:
- whitelist destinations (cluster+namespace) и source repos,
- роли (roles) внутри AppProject с policy-правилами в стиле RBAC, чтобы делегировать действия над приложениями проекта (например, разрешить CI делать sync одного приложения, но не менять source/destination).

Практический вывод:
- если хотим “ИИ/CI может деплоить dev, но не может расширить поверхности (новые namespaces/hosts)” — AppProject roles являются основным рычагом.

---

## 16) Private repositories + declarative setup: что важно для GitOps в enterprise

Официально:
- репозитории и креды задаются через Secrets в namespace Argo CD, с labels:
  - `argocd.argoproj.io/secret-type: repository`
  - `argocd.argoproj.io/secret-type: repo-creds` (шаблоны кредов для префикса URL)
- Argo CD может требовать явный `.git` suffix для GitLab (из-за 301 redirect, который Argo CD не следует).
- для SSH нужны known hosts (`argocd-ssh-known-hosts-cm`), для кастомных CA — `argocd-tls-certs-cm`.

Практический вывод для Synestra:
- секреты и repo credentials должны жить в `synestra-platform` (SOPS), а в `web-core` держим только ссылки/ожидаемые names/keys и runbook (без значений).
- для GitLab/GitHub интеграций важно стандартизовать URL вида `https://.../*.git` там, где это требуется.

---

## 17) Sync Windows: guardrails для stage/prod (официальный механизм)

Официально sync windows позволяют:
- разрешать/запрещать синки по расписанию (allow/deny),
- применять правила матчингом к приложениям, и видеть состояние в UI/CLI.

Практический вывод:
- это один из механизмов, который будет полезен при появлении `stage/prod` (например, запретить auto-sync в “окно” высокой нагрузки),
- для “горячего dev” на ранней стадии чаще не нужен, но стоит помнить как official-tool.

---

## 18) Skip reconcile (alpha): не путать с selfHeal=false

Официально есть аннотация `argocd.argoproj.io/skip-reconcile: "true"`, которая останавливает обработку Application контроллером (и статус не обновляется).

Официальная пометка: это alpha feature (введён в v2.7.0), и основной use-case — интеграция со сторонними контроллерами, а не обычная эксплуатация.

Практический вывод:
- для нашего “Okteto dev поверх ArgoCD” это не основной путь: проще управлять `selfHeal`/`ignoreDifferences` в `dev`, чем полностью выключать reconcile.

---

## 19) Multiple Sources (beta): потенциальный мост к разделению “код” и “GitOps”

Официально Argo CD поддерживает `spec.sources` (несколько источников) как beta-фичу.

Практический вывод:
- если мы захотим строго разделить “helm chart/values” и “app code” по разным репозиториям (или разным путям), при этом собирать один desired state — `sources` может стать официальным механизмом.
- на текущем этапе это “не must-have”, но важно знать, что официальный путь существует.

---

## 20) Следующий шаг (что делать после этого конспекта)

1) Зафиксировать каноничную стратегию “ArgoCD ↔ Okteto drift” для `dev`:
   - либо “`selfHeal: false` в dev” (простое и прозрачное),
   - либо “`selfHeal: true` + `ignoreDifferences` + `RespectIgnoreDifferences=true`” (строже, но требует аккуратного выбора полей).
2) Принять решение, когда переходить от directory/apps-of-apps к ApplicationSet:
   - критерии (количество сайтов/окружений, необходимость previews, нагрузка на repo-server),
   - минимальный PoC (в отдельной ветке/документе).
3) Внедрить `argocd.argoproj.io/manifest-generate-paths` в `deploy/argocd/apps/*/*.yaml` как стандарт (после согласования формулы путей для каждого app).
4) После этого — вернуться к CI контракту (уже в контексте ArgoCD autosync + caching) и привязать его к выбранной модели (directory vs ApplicationSet).

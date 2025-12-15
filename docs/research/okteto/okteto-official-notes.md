# Okteto — конспект официальной документации (для Synestra)

Дата актуальности: **2025-12-15**.  
Версия документации Okteto (по страницам): **1.39**.

Цель: зафиксировать, как **в официальной документации Okteto** предлагается строить:
- интеграцию Okteto ↔ Argo CD (self-hosted),
- inner dev loop (`okteto up` / file sync / dev containers),
- Build service / BuildKit / Registry / переменные,
- preview environments (GitLab CI/CD),

и сопоставить это с тем, что мы уже сделали в `web-core` и `synestra-platform`.

---

## 1) Источники (официальные страницы)

Приоритетные материалы (данные пользователем):

1) Argo CD integration (self-hosted):
   - `https://www.okteto.com/docs/self-hosted/manage/argocd/`
2) BuildKit High Performance (self-hosted):
   - `https://www.okteto.com/docs/self-hosted/manage/buildkit-high-performance/`
3) File synchronization:
   - `https://www.okteto.com/docs/reference/file-synchronization/`
4) Okteto namespaces:
   - `https://www.okteto.com/docs/core/namespaces/`
5) Build service:
   - `https://www.okteto.com/docs/core/build-service/`
6) Okteto manifest (overview):
   - `https://www.okteto.com/docs/core/okteto-manifest/`
7) Container registry:
   - `https://www.okteto.com/docs/core/container-registry/`
8) Okteto variables:
   - `https://www.okteto.com/docs/core/okteto-variables/`
9) Using Okteto CLI:
   - `https://www.okteto.com/docs/development/using-okteto-cli/`
10) Preview environments via GitLab CI/CD:
   - `https://www.okteto.com/docs/previews/using-gitlab-cicd/`

---

## 2) Okteto ↔ Argo CD (Self-Hosted): что рекомендует Okteto

### 2.1. Рекомендованный Sync Policy (для установки Okteto как Helm chart через Argo CD)

Официально Okteto рекомендует (смысловые пункты):
- `automated.prune: true` — Okteto создаёт объекты, имена которых содержат hash (при изменении конфигурации появляются “сироты”, их нужно pruning’ом убирать);
- `automated.selfHeal: true` — держать платформу в desired state;
- `syncOptions`:
  - `RespectIgnoreDifferences=true` — учитывать ignoreDifferences,
  - `PruneLast=true`,
  - `CreateNamespace=true`,
  - `ApplyOutOfSyncOnly=true` — из-за динамически генерируемых сертификатов/ключей (чтобы не пересоздавать лишний раз).

Практический вывод для нас:
- эти рекомендации относятся к **самому Okteto** (как infra-приложению в `synestra-platform`), а не к нашим web‑приложениям.

### 2.2. Ignore differences (почему нужен и что игнорировать)

Официально указаны типовые объекты, которые ArgoCD не сможет “честно” сравнить/воспроизвести без доступа к предыдущему состоянию кластера (Helm templating функции и ресурсы, которые Okteto патчит сам):
- TLS secrets (CA/CRT/KEY поля),
- caBundle у Mutating/ValidatingWebhookConfiguration,
- “внутренние” service accounts с неустойчивыми labels,
- annotations checksum на DaemonSet/Deployment (рестарты внутренних компонентов).

Практический вывод для нас:
- ignoreDifferences нужно держать в манифестах ArgoCD **для платформенного приложения okteto** (и это должно жить в `synestra-platform`).

### 2.3. Caveats из официальной доки (важно для эксплуатации)

Официально упоминается:
- при изменениях конфигурации будут появляться “orphan resources”, которые безопасно prune;
- некоторые изменения могут дать короткий outage (например, пересоздание внутренних сертификатов webhook/wildcardCertificate при определённых настройках).

Практический вывод для нас:
- это напрямую влияет на то, **как** мы будем менять values Okteto (делать осторожно, документировать, ожидать “хеш‑ресурсы”).

---

## 3) Namespaces в Okteto: что это и как это соотнести с нашим неймингом

Официально выделяются:
- **Personal namespaces** — создаются автоматически на пользователя, не удаляются (можно очищать ресурсы, чтобы переиспользовать).
- **Non-personal namespaces** — создаются руками/автоматизацией, можно удалять/передавать; их можно “шерить” для командной работы.

Официальный паттерн нейминга (под preview/feature development):
- namespace может называться по фиче/тикету и т.п.; имеет смысл вести несколько namespaces параллельно.

Практический вывод для нас:
- наши `web-dev-synestra-io` и `web-synestra-io` — это **non-personal** namespaces, и это нормально;
- отдельные ephemeral namespaces под preview‑ветки в будущем логично делать по “тикет/ветка” (это ближе к официальному паттерну, чем “один общий dev namespace на всё”).

---

## 4) Okteto Manifest: “правильная” единица конфигурации

Официально Okteto CLI использует один из манифестов, чтобы понимать “как разворачивать”:
1) Okteto manifest (`okteto.yml` или `.okteto/okteto.yml`);
2) либо Docker Compose (`docker-compose.yaml` и т.п.).

Manifest (overview) описывает несколько логических разделов:
- `build` — как собирать image (context/dockerfile/args…);
- `deploy` — какие команды выполнять для деплоя (часто helm upgrade/install, kubectl apply и т.п.);
- `destroy` — teardown, включая внешние ресурсы;
- `dev` — development containers для `okteto up` (command, `forward`, `sync`);
- `test` — `okteto test` (test containers), рекомендуется через remote execution;
- `external` — ссылки/эндпоинты/ноты в UI (метаданные).

Также в официальной доке явно рекомендуется:
- для `deploy`/`destroy` включать **Remote Execution** (для повторяемости и скорости).

Практический вывод для `web-core`:
- у нас сейчас runbook ориентирован на dev‑режим поверх ArgoCD (то есть деплой делает ArgoCD), поэтому `deploy/destroy` в okteto‑манифесте могут быть:
  - либо пустыми/минимальными,
  - либо использоваться для preview‑окружений (где Okteto сам создаёт среду по ветке).
- `dev` секция — главный кандидат для стандартизации в `web-core` (монорепа + `pnpm --filter`).

---

## 5) File Synchronization: что внутри и как дебажить

Официально:
- при `okteto up` автоматически запускается Syncthing,
- можно получить endpoints/credentials через `okteto status --info`,
- игнорирование файлов делается через `.stignore` в корне синхронизируемой папки,
- `okteto init` может создать дефолтный `.stignore`.

Практический вывод для `web-core` (монорепа):
- если синкаем root репозитория (или несколько больших папок), `.stignore` должен быть рассчитан на Next.js/Payload:
  - исключить `.next/`, `node_modules/`, `.turbo/`, `dist/`, `coverage/`, `.git/` и т.д.;
- если синкаем **несколько путей** (например `apps/synestra-io` и `packages`), то `.stignore` применим к каждому корню синка (важно проверить на практике и зафиксировать в runbook).

---

## 6) Build service / Registry / Variables: как Okteto “официально” закрывает сборки

### 6.1. Build service

Официально:
- `okteto build` запускает билд в удалённом BuildKit, который живёт в кластере,
- image пушится в Okteto Registry,
- Build service решает проблемы локальных ресурсов/эмуляции/повторного использования кеша между участниками команды.

Отличие от “стандартного Docker”:
- Okteto меняет default cache ID для `RUN --mount=type=cache`:
  - cache ID включает имя git‑репозитория (чтобы разные репозитории случайно не делили один и тот же cache);
  - при необходимости можно явно задать `id=...` чтобы шарить кеш между репозиториями.

Также описана функция **Smart Builds**:
- Okteto вычисляет hash build context + параметры, и если image уже собран кем‑то ранее, билд может быть “пропущен” с быстрым reuse.

Практический вывод для нас:
- в текущей схеме мы пока используем GitLab Registry и сборки в CI, но Okteto Build service может стать:
  - альтернативой dev‑сборкам (быстрее inner loop),
  - либо частью CI (если мы решим использовать Okteto token/context и “okteto build” как стандарт).

### 6.2. Registry

Официально:
- у каждого Okteto namespace есть своё пространство в registry,
- не нужно “помнить” имя image — Okteto даёт env vars вида `OKTETO_BUILD_<NAME>_IMAGE`.

Практический вывод:
- для preview‑окружений (ветка → namespace) это крайне удобно;
- для прод‑сборок (GitLab registry) возможно останемся на текущем подходе, но нужно осознанно выбрать.

### 6.3. Okteto Variables

Официально:
- переменные можно использовать для подстановки значений в `okteto.yml`,
- переменные доступны в `deploy/destroy/test` как env vars,
- есть особенности “скоупа” переменных между steps, и механизмы передачи значений.

Практический вывод:
- полезно для унификации “ENV=dev/prod”, “APP_NAME”, “IMAGE” и т.п. в okteto‑манифестах под несколько приложений.

---

## 7) BuildKit High Performance (self-hosted): что рекомендует Okteto

Официальная страница предлагает конкретные рычаги ускорения:
1) выделенный node pool для BuildKit (nodeSelectors/tolerations),
2) вертикальное масштабирование (CPU/Memory) — пример рекомендаций по типам инстансов,
3) SSD storage class для persistence кеша BuildKit + увеличение размера кеша,
4) HPA по метрикам (по умолчанию `okteto_build_active_builds`, плюс CPU/mem/io pressure),
5) spot instances (опционально) + требование идемпотентности команд (из-за ретраев/прерываний),
6) best practices для Dockerfile/remote execution: `.dockerignore`, `.oktetoignore`, cache mounts, test caches.

Практический вывод:
- это напрямую относится к `synestra-platform` (как именно сконфигурирован Okteto chart), но фиксировать требования полезно уже сейчас, чтобы CI/dev сборки не “упирались” в BuildKit.

---

## 8) GitLab CI/CD + Preview environments: что рекомендует Okteto

Официальный tutorial для GitLab previews требует:
- переменные CI: `OKTETO_TOKEN` (обязательная), `OKTETO_CONTEXT` (URL инстанса, опционально),
- `.gitlab-ci.yml` с двумя jobs:
  - `review` — создаёт preview environment на каждую ветку,
  - `stop-review` — уничтожает при merge/delete ветки.

Указанный flow:
1) создать dedicated namespace для preview,
2) build+deploy через Okteto preview, определённый в репозитории,
3) добавить URL preview в Merge Request.

Практический вывод:
- этот паттерн хорошо ложится на будущую “ветка → preview namespace” модель, но отличается от нашего “фиксированный dev namespace + фиксированный prod namespace”.
- Мы можем использовать оба подхода:
  - dev/prod — постоянные,
  - previews — краткоживущие per branch.

---

## 9) Сопоставление с текущими артефактами Synestra (что уже сделано)

### 9.0. Наша фактическая установка Okteto (в `synestra-platform`)

Ниже — *не рекомендации*, а фиксированные факты текущей инсталляции, чтобы понимать, **какие возможности уже доступны** и где менять конфигурацию:

- Установка через Argo CD как платформенное приложение:
  - ArgoCD Application: `synestra-platform/argocd/apps/infra-okteto.yaml`
  - Helm chart: `okteto` `1.39.0`
  - namespace: `okteto`
- Публичные endpoints (Traefik):
  - control‑plane: `okteto.services.synestra.tech`
  - builder (BuildKit): `buildkit.services.synestra.tech`
  - registry: `registry.services.synestra.tech`
- Аутентификация:
  - OIDC через Keycloak (`auth.synestra.io`) — client `okteto` (секреты хранятся в SOPS и не должны попадать в `web-core`).
- Build/Registry:
  - включены BuildKit и Registry с persistence (PVC), что позволяет использовать Okteto как Build service / cache (если решим применять это для dev/previews).
- Ingress‑модель:
  - `okteto-nginx` и `okteto-ingress` отключены, т.к. edge ingress у нас Traefik и мы не хотим конфликтов по IP/портам;
  - следствие: Okteto не “раздаёт” публичные домены сайтов автоматически, сайты обслуживаются нашими Ingress’ами/Traefik, а Okteto используется как dev‑loop поверх workloads.
- Namespaces:
  - включены `userDefinedNamespaces` и префикс namespaces `web` (см. `synestra-platform/infra/okteto/values.yaml`),
  - при этом нужно отдельно зафиксировать канон “Okteto namespace vs k8s namespace” (см. ниже).

### 9.1. Что уже соответствует официальным рекомендациям

- Okteto развёрнут как self-hosted через ArgoCD (платформенная часть).
- В `synestra-platform` учтён смысл `ignoreDifferences`/`syncOptions` для стабильности (см. отдельные platform‑docs и values).
- В `web-core` dev/prod разделены на разные ArgoCD Applications и namespaces (что упрощает подключение Okteto dev‑режима к dev‑workload).

### 9.2. Где нужно “свести” наши runbooks с официальным Okteto‑подходом

1) Локация и формат okteto‑манифеста:
   - официальный стандарт: `okteto.yml` или `.okteto/okteto.yml`;
   - в `web-core` зафиксирован подход: **единый** `.okteto/okteto.yml` в корне монорепы (несколько dev‑контейнеров под разные apps).

2) File sync:
   - `.stignore` и `okteto status --info` включены в `docs/runbooks/runbook-okteto-dev.md`, дальше дополняем исключения по факту.

3) Build service/registry:
   - принять решение: используем ли мы Okteto Build service/Registry для dev/previews (или остаёмся на GitLab registry).
4) Namespaces:
   - закрепить канон “Okteto namespace vs k8s namespace” для схемы “Okteto dev поверх ArgoCD‑деплоя”.

---

## 10) Следующий шаг (после этого конспекта)

1) Закрыть блокер namespaces:
   - выбрать ownership’а namespace (создаёт Okteto vs создаёт ArgoCD) и описать точные шаги в `docs/runbooks/runbook-okteto-dev.md`.
2) Сделать первый “эталонный” запуск dev‑сессии (`okteto up`) для одного приложения (например `synestra-io`) и задокументировать диагностику (`okteto status --info`, конфликтующие файлы, порты).
3) Затем переходить к Argo CD докам уже “в контексте Okteto”: как правильно делать ignoreDifferences, drift, selfHeal и т.п.

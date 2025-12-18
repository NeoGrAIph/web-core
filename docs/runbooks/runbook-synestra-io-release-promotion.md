# Runbook: привести `synestra.io` к канону release‑promotion (release-dev → release-prod)

Дата актуальности: **2025-12-15**.  
Канон: `docs/architecture/release-promotion.md`.

Цель: чтобы deployments **`dev.synestra.io`** и **`synestra.io`** выкатывались по схеме:

1) CI публикует новый образ и выкатывает его **сначала в dev** (через `release-dev`).
2) После проверки dev CI делает **promotion** в prod (через `release-prod`).
3) При необходимости dev можно быстро вернуть к baseline, равному prod.

---

## 1) Что должно быть в `web-core` (GitOps истина)

### 1.1. Values слои (не‑секреты)

Для `synestra-io` должны существовать 4 файла:

- `deploy/env/dev/synestra-io.yaml` (env‑слой dev: домен `dev.synestra.io`, `SYNESTRA_ENV=dev`, Secret refs)
- `deploy/env/prod/synestra-io.yaml` (env‑слой prod: домен `synestra.io`, `SYNESTRA_ENV=prod`, Secret refs)
- `deploy/env/release-dev/synestra-io.yaml` (dev release: `image.repository` + `image.tag`)
- `deploy/env/release-prod/synestra-io.yaml` (prod release: `image.repository` + `image.tag`)

Примечание: release‑файлы должны содержать **только** не‑секретные поля (никаких токенов/ключей).

### 1.2. Argo CD Applications

Должны существовать 2 приложения:

- `deploy/argocd/apps/dev/synestra-io.yaml` (`web-synestra-io-dev`)
  - `valueFiles` должны подключать:
    - `../../env/release-dev/synestra-io.yaml`
    - `../../env/dev/synestra-io.yaml`
  - `selfHeal: false` (dev допускает drift для Okteto)

- `deploy/argocd/apps/prod/synestra-io.yaml` (`web-synestra-io-prod`)
  - `valueFiles` должны подключать:
    - `../../env/release-prod/synestra-io.yaml`
    - `../../env/prod/synestra-io.yaml`
  - `selfHeal: true` (prod GitOps‑строго)

---

## 2) Что должно быть в `synestra-platform` (секреты и CI)

### 2.1. Secrets (SOPS) по namespaces

В namespaces:
- `web-synestra-io-dev`
- `web-synestra-io-prod`

должны быть созданы:

1) `gitlab-regcred` (если registry приватный)
2) Secret с env vars приложения, подключаемый через `envFrom.secretRef`:
   - dev: `web-synestra-io-dev-env`
   - prod: `web-synestra-io-prod-env`

А база данных создаётся и управляется отдельно в namespace `databases` через CloudNativePG:
- initdb secret: `synestra-io-initdb-secret` (общий для prod/dev)
- CNPG clusters:
  - `synestra-io-dev-cnpg`
  - `synestra-io-cnpg`

Важно: в `web-core` должны быть только **ссылки** на имена Secret’ов/ключи.

### 2.2. CI: build → deploy dev → validate → promote prod

CI должен делать promotion **коммитами в `web-core`**, не дергая “ручные” kubectl‑патчи:

1) Build:
   - собрать image `web-synestra-io` (immutable tag, обычно SHA)
   - push в registry

Примечание по текущей реализации сборки `web-synestra-io`:
- в `synestra-platform` задаётся, какой commit `web-core` собирать (`WEB_CORE_REF`) и какой tag присвоить образу (`VERSION`);
- `WEB_CORE_REF` должен быть **полным 40‑символьным SHA** (короткий SHA может не воспроизводиться в CI).
Подробности и пути см. в `docs/architecture/ci-cd-contract.md`.

2) Dev release:
   - commit в `web-core`: обновить `deploy/env/release-dev/synestra-io.yaml:image.tag`
   - дождаться, что ArgoCD выкатил dev (варианты ожидания):
     - `argocd app wait web-synestra-io-dev --health --sync`
     - или проверка HTTP на `https://dev.synestra.io/` (если ArgoCD доступ из CI не настроен)

3) Validate dev:
   - smoke‑проверки (минимум):
     - `GET https://dev.synestra.io/`
     - `GET https://dev.synestra.io/admin` (как минимум не должен быть 5xx/циклических редиректов)

4) Promote prod:
   - commit в `web-core`: обновить `deploy/env/release-prod/synestra-io.yaml:image.tag` тем же tag
   - дождаться rollout prod (`argocd app wait web-synestra-io-prod ...` или HTTP smoke на `https://synestra.io/`)

Отдельное решение (по желанию):
- сделать promotion job **manual** (кнопка в GitLab), если хотим человеческий gate для prod.

Про “не зациклить CI”: см. `docs/runbooks/runbook-ci-dev-to-prod.md` (вариант `[skip ci]` или rules по путям `deploy/env/release-{dev,prod}/*`).

---

## 3) Процесс разработки (для разработчика/агента)

1) В dev можно работать “на горячую” через Okteto поверх baseline‑деплоя:
   - `okteto up ...` (см. `docs/runbooks/runbook-okteto-dev.md`)
2) Когда изменение готово:
   - фиксируем в Git (PR/merge)
3) CI выкатывает dev release
4) После проверки CI делает promotion в prod

---

## 4) Как вернуть dev к baseline, равному prod

Есть два сценария:

1) Drift только от Okteto:
   - `okteto down ...`
   - `argocd app sync web-synestra-io-dev`

2) Dev tag ушёл вперёд и нужно “как в prod”:
   - привести `deploy/env/release-dev/synestra-io.yaml:image.tag` к значению из `deploy/env/release-prod/synestra-io.yaml`
   - дождаться sync dev в Argo CD

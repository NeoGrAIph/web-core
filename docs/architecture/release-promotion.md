# Канон: dev → prod через promotion (release-dev / release-prod)

Дата актуальности: **2025-12-15**.  
Статус: **канон v0.1** (может уточняться по мере изучения официальных рекомендаций Argo CD / Okteto / Payload CMS 3).

Цель этого канона: дать **предсказуемый и безопасный** поток релизов без `stage` на старте проекта:

1) разработка и быстрые итерации происходят в `dev` (включая hot‑dev через Okteto);
2) `prod` получает **только проверенные** изменения через promotion (обновление отдельного release‑слоя);
3) при необходимости `dev` можно быстро привести к baseline, равному `prod`.

---

## 0) Почему `dev` и `prod` нужны сразу (а не “сначала только dev”)

1) `prod` нужен как baseline с первого дня: это эталон “как должно быть”, к которому можно:
   - откатывать dev (и дрейф от Okteto),
   - сравнивать поведение, миграции, ingress/TLS и интеграции.
2) GitOps/Argo CD проще вводить, когда desired state для `prod` уже описан декларативно (пусть даже сначала без реального трафика): меньше ручных сюрпризов при включении домена.
3) Okteto dev-loop рассчитан на долго живущее dev‑окружение/namespace для коллаборации; при этом `prod` остаётся “строгим” и не ловит временный dev‑дрейф.

---

## 1) Что такое “release” в нашем контексте

**Release = immutable image tag** (обычно SHA коммита), который разворачивается в Kubernetes.

Почему так:
- Argo CD хорошо работает, когда “что развернуть” описано в Git и меняется коммитами;
- immutable tag снижает риск “переехал `latest` → неожиданно изменилось поведение”;
- promotion становится простым и наглядным: “dev tag → prod tag”.

---

## 1.1) Артефакты (что должно существовать в репозиториях)

### В `~/repo/web-core`

- Код приложения: `apps/<site>/...` (обычно стартуем с `upstream/payload/templates/website`, далее адаптация под монорепо).
- GitOps (без plaintext‑секретов):
  - env‑слои: `deploy/env/dev/<site>.yaml`, `deploy/env/prod/<site>.yaml` (домены, ресурсы, ссылки на Secret’ы).
  - release‑слои: `deploy/env/release-dev/<site>.yaml`, `deploy/env/release-prod/<site>.yaml` (только `image.*`).
  - ArgoCD Applications: `deploy/argocd/apps/dev/<site>.yaml`, `deploy/argocd/apps/prod/<site>.yaml`.

### В `~/synestra-platform`

- Namespaces и SOPS‑секреты (env secret, db init secret, imagePullSecret и т.п.) для соответствующих namespaces.
- Платформенная часть (DNS/TLS/Traefik, ArgoCD, Okteto, CNPG operator) — живёт и управляется платформой; сайты используют этот контракт.

---

## 2) Слои values и где хранится истина

Мы разделяем Helm values на два типа слоёв:

### 2.1. Release‑слой (только образ)

Release‑слой хранит **только**:
- `image.repository`
- `image.tag`
- (опционально) `image.pullSecrets`
- (опционально) значения, которые логически являются частью “release идентичности” (например `APP_NAME` как указатель на workspace пакет).

И главное: release‑слой **разделён по окружениям**:

- `deploy/env/release-dev/<app>.yaml`
- `deploy/env/release-prod/<app>.yaml`

Это позволяет dev быть “впереди”, не затрагивая prod.

### 2.2. Env‑слой (конфигурация окружения)

Env‑слой хранит:
- домены/ingress,
- `SYNESTRA_ENV=dev|prod`,
- ресурсы/HPA/feature flags,
- **ссылки** на Secret’ы (`envFrom.secretRef`, имена/ключи), но не значения.

Файлы:
- `deploy/env/dev/<app>.yaml`
- `deploy/env/prod/<app>.yaml`

---

## 3) Argo CD Applications: как подключаются слои

Для каждого приложения есть два Argo CD `Application`:

### 3.1. Dev Application

Подключает:
- `../../env/release-dev/<app>.yaml`
- `../../env/dev/<app>.yaml`

Политика reconcile:
- `selfHeal: false` (dev допускает временный drift из‑за Okteto).

Важно: ожидается autosync (CI коммитит values, ArgoCD сам применяет; CI не обязан дергать ArgoCD API).

### 3.2. Prod Application

Подключает:
- `../../env/release-prod/<app>.yaml`
- `../../env/prod/<app>.yaml`

Политика reconcile:
- `selfHeal: true` (prod GitOps‑строго).

---

## 4) Полный pipeline (сквозной)

### 4.1. Bootstrap нового сайта (один раз)

1) Создаём приложение в `apps/<site>` (как правило — стартуем с `upstream/payload/templates/website`).
2) Добавляем GitOps артефакты:
   - `deploy/env/dev/<site>.yaml`, `deploy/env/prod/<site>.yaml`
   - `deploy/env/release-dev/<site>.yaml`, `deploy/env/release-prod/<site>.yaml`
   - `deploy/argocd/apps/dev/<site>.yaml`, `deploy/argocd/apps/prod/<site>.yaml`
3) В `synestra-platform` добавляем секреты (SOPS) для обоих namespaces (dev+prod).

### 4.2. Ежедневная разработка (dev‑loop)

1) Argo CD держит dev baseline (стабильный образ + секреты + БД).
2) Разработчик/агент запускает Okteto dev‑сессию поверх dev‑деплоя:
   - синхронизирует код,
   - запускает `next dev`,
   - проверяет UI/API на dev‑домене.

### 4.3. “Зафиксировали” → dev release

1) Код фиксируется в Git (merge в ветку, которую мы считаем источником релизов).
2) CI собирает image с immutable tag и пушит в registry.
3) CI коммитит обновление **только** в `deploy/env/release-dev/<app>.yaml:image.tag`.
4) Argo CD авто‑выкатывает новый image в dev.

### 4.4. Валидация dev

Минимум:
- smoke‑проверка публичного URL (главная, `/admin`, health endpoint если есть).

Варианты “как именно валидировать” (можно комбинировать):
- CI HTTP smoke checks по dev‑домену (быстро, просто, независит от ArgoCD hooks).
- GitOps‑подход: PostSync hook Job/проверки (чтобы sync считался успешным только после проверок).

### 4.5. Promotion в prod

1) Если dev валиден — CI делает второй коммит:
   - обновляет `deploy/env/release-prod/<app>.yaml:image.tag` на **тот же tag**, который проверен в dev.
2) Argo CD выкатывает prod автоматически.

---

## 5) Сброс dev к baseline, равному prod

Есть два разных “сброса”, важно не путать:

1) **Сброс drift от Okteto**:
   - завершить dev‑сессию (`okteto down ...`),
   - `argocd app sync <dev-app>`.

2) **Сброс dev релиза к prod релизу** (если dev tag ушёл вперёд и нужно вернуться):
   - привести `deploy/env/release-dev/<app>.yaml:image.tag` к значению из `deploy/env/release-prod/<app>.yaml`,
   - дождаться sync в Argo CD.

---

## 5.1) Откат prod (важное ограничение про миграции)

- Откат `prod` делаем GitOps‑ом: `git revert` (или явная установка предыдущего `image.tag` в `deploy/env/release-prod/<app>.yaml`).
- Миграции БД для Payload чаще всего считаем forward‑only: откат кода ≠ откат схемы. Поэтому:
  - миграции проектируются совместимыми (или с отдельным планом отката),
  - “ломающие” изменения требуют осознанного релизного процесса.

---

## 6) Как это масштабируется на `stage`

Когда появится `stage`, добавляем третий release‑слой:
- `deploy/env/release-stage/<app>.yaml`

и соответствующий env‑слой `deploy/env/stage/<app>.yaml` + ArgoCD Applications для stage.

---

## 7) Где это описано в репозитории

- Runbook dev+prod: `docs/runbooks/runbook-dev-prod-flow.md`
- Runbook CI promotion: `docs/runbooks/runbook-ci-dev-to-prod.md`
- Drift/hot‑dev: `docs/runbooks/runbook-okteto-dev.md`
- Архитектура и границы ответственности: `docs/architecture/architecture.md`

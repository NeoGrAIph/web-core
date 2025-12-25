# runbook-platform-integration.md

Runbook: какие шаги нужны в `synestra-platform`, чтобы **подключить `web-core`** и получить рабочую схему:

- `dev` (hot через Okteto) на dev‑домене (обычно `sitename.dev.synestra.tech` или `dev.sitename.synestra.tech`; для корневых доменов — `dev.<root>`, например `dev.synestra.io`)
- `prod` (GitOps‑строго) на прод‑домене `*.synestra.io`

Этот документ стыкует два репозитория:
- `~/repo/web-core` — код приложений, Helm‑чарт `deploy/charts/web-app` и все **deploy‑values** в `deploy/env/*`.
- `~/repo/synestra-platform` — инфраструктура (Traefik, cert-manager, Okteto, ArgoCD, SOPS) и **ArgoCD Applications** для web‑core.

## 0) Что уже есть в `synestra-platform` (важно знать)

### TLS / wildcard сертификаты

В `synestra-platform` уже заведены wildcard сертификаты и Traefik TLSStore:

- cert-manager Certificates (namespace `ingress`):
  - `wildcard-dev-synestra-tech-tls` для `*.dev.synestra.tech`
  - `wildcard-synestra-io-tls` для `synestra.io` и `*.synestra.io`
  - `wildcard-services-synestra-tech-tls` для `*.services.synestra.tech` (Okteto endpoints)
  - см. `infra/cert-manager/resources/certificate-wildcard-*.yaml`
- Traefik `TLSStore default` содержит эти secrets:
  - `infra/ingress/traefik/resources/tlsstore-default.yaml`

Следствие: для сайтов достаточно включить TLS на роутере Traefik (`router.tls=true`), а конкретный сертификат подберётся по SNI.

Важно: Kubernetes `Ingress.spec.tls[].secretName` должен ссылаться на Secret в *том же namespace*, поэтому мы **не** пытаемся указывать TLS secretName для wildcard‑сертификатов из namespace `ingress`. Рекомендованный паттерн описан в `synestra-platform/docs/wiki/tls-wildcard-traefik.md` и реализован в chart `deploy/charts/web-app` (Traefik TLSStore‑подбор по SNI).

### Okteto

Okteto Self‑Hosted уже развернут GitOps’ом:
- приложение: `argocd/apps/infra-okteto.yaml`
- домен control‑plane: `okteto.synestra.tech` (также есть `buildkit.okteto.synestra.tech` и `registry.okteto.synestra.tech`)
- в нашей установке отключены `okteto-nginx` и `okteto-ingress` — пользовательские сайты/дев‑домены остаются на наших Ingress’ах/Traefik, Okteto используется как dev‑loop поверх workloads
- см. `docs/wiki/okteto.md` в `synestra-platform`.

Важный практический нюанс для работы Okteto CLI:
- параметр `cluster.endpoint` в Helm values Okteto должен совпадать с SAN сертификата Kubernetes API server, иначе `okteto up` будет падать с ошибкой `x509: certificate is valid for ... not <host>`.
- это настраивается в `synestra-platform/infra/okteto/values.yaml` (и относится именно к платформенной установке Okteto).

## 1) DNS (вне Git)

Нужно, чтобы DNS указывал на публичный IP Traefik LoadBalancer (в `synestra-platform` это `212.237.216.94`).

Минимум:
- `*.dev.synestra.tech` → Traefik LB IP
- `*.synestra.io` → Traefik LB IP

## 2) Доступ ArgoCD к репозиториям

ArgoCD должен читать **оба** репозитория:
- `web-core` (Helm chart `deploy/charts/web-app` + values в `deploy/env/*`)
- `synestra-platform` (ArgoCD Applications)

Если `web-core` приватный — добавьте repo credentials в ArgoCD (`argo` ns, SOPS‑секрет). `synestra-platform` уже подключён как git@gitlab.com:synestra/synestra-platform.git.

## 3) AppProject и приложения ArgoCD (истина в `synestra-platform`)

- AppProject: `synestra-platform/argocd/apps/app-projects.yaml` содержит `synestra-web` (whitelist web‑namespaces, репозитории GitHub/GitLab).
- Приложения находятся **в платформенном репозитории**:
  - `argocd/apps/web-payload-dev.yaml`
  - `argocd/apps/web-payload-core.yaml`
  - `argocd/apps/web-synestra-io-dev.yaml`
  - `argocd/apps/web-synestra-io-prod.yaml`

Паттерн: single-source Helm (values лежат в `web-core`)
```
sources:
  - repoURL: https://github.com/NeoGrAIph/web-core.git
    path: deploy/charts/web-app
    helm:
      valueFiles:
        - ../env/<env>/<app>.yaml
        - ../env/release-<env>/<app>.yaml
```
Таким образом, **chart и values живут в web-core**, а **Applications — в synestra-platform**.

Dev‑namespaces создаём через Okteto; в Applications включён `CreateNamespace=true` только где это безопасно.

## 5) Секреты для сайтов (SOPS, `synestra-platform`)

Для каждого deployment (`web-<app>-dev` / `web-<app>-prod`) должны существовать:

1) `gitlab-regcred` (imagePullSecret), если образы лежат в приватном GitLab Registry  
   - имя: `gitlab-regcred`
   - namespace: `web-<app>-dev` и `web-<app>-prod`
   - web-core ожидает это имя в `deploy/env/release-{dev,prod}/*.yaml`.

2) Secret с env vars приложения, подключаемый через `envFrom.secretRef`  
   Пример имён:
   - dev: `web-corporate-dev-env`
   - prod: `web-corporate-prod-env`

   Минимальные ключи (см. `docs/runbooks/runbook-env-contract.md`):
   - `PAYLOAD_SECRET`
   - опционально: `CRON_SECRET`, `PREVIEW_SECRET`
    - для shop: Stripe keys

   (При необходимости) `DATABASE_URI` хранится в этом же secret.

3) База данных Postgres через CloudNativePG (CNPG)

Канон (рекомендуется): **platform-managed DB** в namespace `databases`:
- initdb secret (SOPS): `secrets/databases/<app-key>-initdb-secret.yaml`
- CNPG clusters: `infra/databases/cloudnativepg/<app-key>` и `<app-key>-dev`
- ArgoCD apps: `infra-<app-key>-db` и `infra-<app-key>-dev-db`
- в web secrets (`web-<app-key>-<env>-env`) хранится готовый `DATABASE_URI`, который указывает на сервис CNPG в `databases`.

Runbook: `docs/runbooks/runbook-database-cnpg.md`.

Альтернатива (только для POC): per-namespace DB, когда CNPG Cluster создаёт chart `deploy/charts/web-app` в namespace приложения (тогда нужны `*-db-init` secrets в web‑namespace и `postgres.enabled=true`).

После добавления секретов:
- синхронизировать `infra-secrets` в ArgoCD (`synestra-platform/argocd/apps/infra-secrets.yaml`).

## 6) Values и образы (где лежат)

- Dev/prod values: `web-core/deploy/env/{dev,prod}/<app>.yaml`.
- Release‑слои (image tag): `web-core/deploy/env/release-{dev,prod}/<app>.yaml`.
- Образы для prod: собираются в `synestra-platform/docker/web-*/` (CI `build_web_*`), теги пишутся в `deploy/env/release-prod/<app>.yaml`.
- Dev‑образы: собираются в `synestra-platform/docker/web-*/` (CI `build_web_*`), теги пишутся в `deploy/env/release-dev/<app>.yaml`.
- Для обновления тега меняем соответствующий `release-*.yaml`, рендерим `helm template` + `kubeconform`, затем ArgoCD sync.

### Dev‑режим payload.dev
- `payload.dev.synestra.tech` работает на Next.js 15 в **`next dev`** (горячая перезагрузка, HMR, без standalone build).
- Payload CMS 3 запущен в dev‑mode (`NODE_ENV=development`), поэтому отражает изменения схем/блоков сразу после sync образа.
- Dev‑образ: `registry.gitlab.com/synestra/synestra-platform/payload:<docker/payload/VERSION>`; сборка управляется `build_payload_dev` в CI `synestra-platform`.

## 6) Проверка интеграции

После подключения root Application `web-core` в ArgoCD должны появиться child Applications:
- `web-payload-dev`, `web-payload-core`
- `web-synestra-io-dev`, `web-synestra-io-prod`

Далее:
- проверить, что Ingress’ы создаются в правильных namespaces;
- если используем platform-managed DB: проверить, что CNPG clusters в namespace `databases` (`infra-*-db` apps) в состоянии `Healthy`;
- проверить, что открываются домены:
  - dev: `https://corporate.dev.synestra.tech`
  - prod: `https://corporate.synestra.io`

## 7) Okteto dev‑режим поверх dev‑деплоя

Runbook: `docs/runbooks/runbook-okteto-dev.md` (в процессе переноса в платформенную доку).

Напоминание:
- dev namespace создаём через Okteto (`okteto namespace create web-<app>-dev`), не пересоздаём его Helm’ом.
- В dev Applications selfHeal выключен, чтобы Okteto патчи не откатывались мгновенно.

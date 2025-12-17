# runbook-platform-integration.md

Runbook: какие шаги нужны в `synestra-platform`, чтобы **подключить `web-core`** и получить рабочую схему:

- `dev` (hot через Okteto) на dev‑домене (обычно `sitename.dev.synestra.tech` или `dev.sitename.synestra.tech`; для корневых доменов — `dev.<root>`, например `dev.synestra.io`)
- `prod` (GitOps‑строго) на прод‑домене `*.synestra.io`

Этот документ специально “стыкует” два репозитория:
- `~/repo/web-core` — код и GitOps‑артефакты приложений (values/charts/ArgoCD Applications)
- `~/synestra-platform` — кластерная инфраструктура (Traefik, cert-manager, Okteto, ArgoCD, секреты, runner/CI)

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

## 2) Доступ ArgoCD к репозиторию `web-core`

Если репозиторий `web-core` публичный — ArgoCD может читать его без credentials.

Если приватный — нужно добавить repo credentials в ArgoCD (в `synestra-platform`, через SOPS‑секрет в namespace `argo`).

Цель: ArgoCD должен уметь читать:
- `deploy/charts/web-app`
- `deploy/env/**`
- `deploy/argocd/apps/**`

## 3) AppProject для web‑приложений (рекомендуется)

В `synestra-platform` стоит завести отдельный AppProject, например `synestra-web`, который разрешает:
- destinations: `web-*-dev`, `web-*-prod` (и позже stage)
- cluster resources: `Namespace` (если используем `CreateNamespace=true` для stage/prod или отдельных случаев).

Примечание (Okteto dev‑loop):
- для dev namespaces в нашей схеме обычно **не** используем `CreateNamespace=true`,
- потому что dev namespace должен быть создан как Okteto namespace, иначе он не появится в Okteto UI/CLI.

Файл: `synestra-platform/argocd/apps/app-projects.yaml`.

После этого в `web-core/deploy/argocd/apps/**` нужно заменить `spec.project: default` на `synestra-web`.

## 4) Root Application “web-core” в `synestra-platform`

В `synestra-platform/argocd/apps/` добавляется один root Application (app‑of‑apps), который применяет child Applications из `web-core`.

Рекомендуемый паттерн:
- root: `argocd/apps/web-core.yaml` в `synestra-platform`
- source repoURL: репозиторий `web-core`
- path: `deploy/argocd/apps` (recurse)

Это позволит подключить все сайты одной точкой и дальше управлять ими из `web-core`.

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

   Минимальные ключи (см. `docs/architecture/env-contract.md`):
   - `PAYLOAD_SECRET`
   - `DATABASE_URI`
    - опционально: `CRON_SECRET`, `PREVIEW_SECRET`
    - для shop: Stripe keys

3) База данных Postgres через CloudNativePG (CNPG)

Канон (рекомендуется): **platform-managed DB** в namespace `databases`:
- initdb secret (SOPS): `secrets/databases/<app-key>-initdb-secret.yaml`
- CNPG clusters: `infra/databases/cloudnativepg/<app-key>` и `<app-key>-dev`
- ArgoCD apps: `infra-<app-key>-db` и `infra-<app-key>-dev-db`
- в web secrets (`web-<app-key>-<env>-env`) хранится готовый `DATABASE_URI`, который указывает на сервис CNPG:
  - dev: `<app-key>-dev-cnpg-rw.databases.svc.cluster.local`
  - prod: `<app-key>-cnpg-rw.databases.svc.cluster.local`

Runbook: `docs/runbooks/runbook-database-cnpg.md`.

Альтернатива (только для POC): per-namespace DB, когда CNPG Cluster создаёт chart `deploy/charts/web-app` в namespace приложения (тогда нужны `*-db-init` secrets в web‑namespace и `postgres.enabled=true`).

После добавления секретов:
- синхронизировать `infra-secrets` в ArgoCD (`synestra-platform/argocd/apps/infra-secrets.yaml`).

## 6) Проверка интеграции

После подключения root Application `web-core` в ArgoCD должны появиться child Applications:
- `web-corporate-dev`, `web-corporate-prod`
- `web-shop-dev`, `web-shop-prod`

Далее:
- проверить, что Ingress’ы создаются в правильных namespaces;
- если используем platform-managed DB: проверить, что CNPG clusters в namespace `databases` (`infra-*-db` apps) в состоянии `Healthy`;
- проверить, что открываются домены:
  - dev: `https://corporate.dev.synestra.tech`
  - prod: `https://corporate.synestra.io`

## 7) Okteto dev‑режим поверх dev‑деплоя

Runbook по логике “Okteto поверх ArgoCD” (под монорепу): `docs/runbooks/runbook-okteto-dev.md`.

Важно: чтобы Okteto мог патчить workload в dev, для dev‑Applications обычно нужен режим без self‑heal (см. `docs/runbooks/runbook-dev-prod-flow.md`).

Важно №2 (не повторять прошлую ошибку):
- dev namespace должен быть создан как **Okteto namespace** (`okteto namespace create web-<app>-dev`),
- поэтому для dev Applications в `web-core` **не используем** `CreateNamespace=true`,
- иначе ArgoCD может пересоздать namespace “без Okteto ownership” и он исчезнет из Okteto UI/CLI.

# Runbook: синхронизировать dev‑БД с prod‑БД (refresh/clone) для web‑приложения на CloudNativePG

Статус: актуально на **2025-12-16**.  
Связанные каноны:
- `docs/architecture/database-cnpg.md`
- `docs/runbooks/runbook-database-cnpg.md`

Цель: получить dev‑окружение, где **данные максимально соответствуют prod**, чтобы:
- воспроизводить баги на реальных данных,
- тестировать миграции/перфоманс на репрезентативном датасете,
- не “вариться” в устаревшей dev‑реальности.

Важно: этот runbook описывает **refresh dev из prod без пуша в Git**, как осознанную *dev‑исключение* из GitOps. Инфраструктура остаётся source‑of‑truth в Git, но **данные dev‑БД** допускают управляемый drift.

---

## 0) Термины и предпосылки

Мы используем CNPG кластера в namespace `databases`:
- prod: `<app-key>-cnpg`
- dev: `<app-key>-dev-cnpg`

И один initdb secret (пока допустимо) для dev+prod:
- `databases/<app-key>-initdb-secret` с ключами `username`/`password`.

---

## 1) Каноничный путь (финальный): CNPG Backup/ScheduledBackup → recovery

Это **лучший** и самый “правильный” путь для:
- регулярных бэкапов prod (RPO/RTO),
- предсказуемого восстановления (включая PITR, если включим),
- “кнопки refresh” через восстановление dev из backup.

Но ему нужны входные данные, которых сейчас может не быть в кластере:
- S3/MinIO (object storage) и секрет с доступами;
- `spec.backup.barmanObjectStore` на prod‑кластере;
- `ScheduledBackup` или on-demand `Backup`.

Пока это не внедрено — используем временный путь из раздела 2.

### 1.1. Минимальный чеклист для включения barmanObjectStore

Что нужно подготовить в `synestra-platform` (и применить ArgoCD‑ом):

1) Object Storage (S3‑compatible):
   - endpoint (если не AWS),
   - bucket,
   - base path (destinationPath),
   - регион (если требуется провайдером),
   - CA bundle (если self‑signed).

2) SOPS‑секрет в namespace `databases` для CNPG S3 credentials, например:
   - `secrets/databases/cnpg-backup-s3-credentials-<site>.yaml` (пример: `cnpg-backup-s3-credentials-synestra-io`).

Рекомендуемые ключи в Secret (чтобы ссылки в манифестах были “шаблонными”):
- `accessKeyId`
- `secretAccessKey`
- `region` (опционально)
- `sessionToken` (опционально)

3) На prod CNPG Cluster добавить `spec.backup.barmanObjectStore`:
   - `destinationPath: s3://<bucket>/<prefix>/<cluster>`
   - `endpointURL` (если нужно)
   - `s3Credentials.accessKeyId` → secret+key
   - `s3Credentials.secretAccessKey` → secret+key
   - (опционально) `s3Credentials.region` → secret+key
   - (опционально) `endpointCA` → secret+key

4) Делать on-demand backup вручную (CR `Backup`) и использовать его как “источник” для восстановления dev через `bootstrap.recovery`.

Дальше refresh dev делается “правильно”: пересозданием dev‑кластера через `bootstrap.recovery` из backup (а не через `pg_dump`).

#### Как делать on-demand backup вручную (вместо ScheduledBackup)

Если `barmanObjectStore` уже включён на prod‑кластере, on-demand backup запускается созданием CR `Backup`.

Для `synestra.io` шаблон лежит в `synestra-platform` и **не подключён** в GitOps kustomization:
- `synestra-platform/infra/databases/cloudnativepg/synestra-io/backup-manual.yaml`

Запуск (пример):
```bash
kubectl apply -f /home/neograiph/synestra-platform/infra/databases/cloudnativepg/synestra-io/backup-manual.yaml
kubectl -n databases get backups.postgresql.cnpg.io -o wide
```

---

## 2) Временный путь (рабочий сейчас): in‑cluster `pg_dump | pg_restore`

Этот вариант:
- не требует S3/MinIO,
- выполняется внутри кластера (без локального дампа),
- подходит для старта, пока не настроены “настоящие” backup’и.

Ограничения:
- нет PITR и ретеншна “из коробки”,
- при активных подключениях к dev‑БД возможны lock‑конфликты,
- на больших БД может занимать заметное время/CPU.

### 2.1. Рекомендованный порядок

1) Убедиться, что dev‑приложение не держит подключения к dev‑БД:
   - на старте достаточно просто “не трогать dev сайт” во время refresh,
   - лучше — временно “поставить на паузу” dev workload (scale to 0).

2) Запустить refresh Job в `databases`.

3) Дождаться `Complete` и удалить Job (он одноразовый).

### 2.2. Пример для `synestra.io` (prod → dev)

Job‑манифест лежит в платформенном репо (GitOps/infra):
- `synestra-platform/infra/databases/cloudnativepg/synestra-io-dev/refresh-dev-from-prod-job.yaml`

Запуск:

```bash
kubectl apply -f /home/neograiph/synestra-platform/infra/databases/cloudnativepg/synestra-io-dev/refresh-dev-from-prod-job.yaml
kubectl -n databases wait --for=condition=complete job/refresh-synestra-io-dev-db-from-prod --timeout=30m
kubectl -n databases logs job/refresh-synestra-io-dev-db-from-prod
```

Очистка (после успешного запуска):

```bash
kubectl -n databases delete job/refresh-synestra-io-dev-db-from-prod
```

---

## 3) Правила безопасности (важно)

- refresh разрешён **только** в dev‑БД (не в prod).
- в манифестах/скриптах **не должно быть** plaintext‑секретов: только `secretKeyRef`.
- желательно иметь “предохранитель” от перепутанных host’ов (в нашем Job он есть).

---

## 4) Что улучшить следующим шагом

Чтобы сделать refresh “каноничным” и масштабируемым на ~20 сайтов:
- завести объектное хранилище (S3/MinIO) под backup’и CNPG,
- добавить `spec.backup.barmanObjectStore` и `ScheduledBackup` для prod‑кластеров,
- заменить “pg_dump refresh” на “recovery dev кластера из backup”.

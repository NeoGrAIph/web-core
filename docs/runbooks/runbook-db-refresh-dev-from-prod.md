# Runbook: синхронизировать dev‑БД с prod‑БД (refresh/clone) для web‑приложения на CloudNativePG

Статус: актуально на **2025-12-16**.  
Связанные каноны:
- `docs/runbooks/runbook-database-cnpg.md`
- `docs/runbooks/runbook-database-cnpg.md`

Цель: получить dev‑окружение, где **данные максимально соответствуют prod**, чтобы:
- воспроизводить баги на реальных данных,
- тестировать миграции/перфоманс на репрезентативном датасете,
- не “вариться” в устаревшей dev‑реальности.

Важно: этот runbook описывает **refresh dev из prod без пуша в Git**, как осознанную *dev‑исключение* из GitOps. Инфраструктура остаётся source‑of‑truth в Git, но **данные dev‑БД** допускают управляемый drift.

Важно (про медиа/PVC): синхронизация **только БД** не переносит файлы uploads.
Если у приложения медиа хранится на PVC (например, `apps/<app>/public/media`), то после refresh dev‑БД ссылки на файлы из prod будут существовать в данных, но сами файлы в dev могут отсутствовать → на фронте/в админке будут `404` на `/api/media/file/...`.
Решение: либо дополнительно синхронизировать media‑PVC (см. раздел 6), либо переводить хранение медиа на object storage (S3/MinIO) и уже тогда refresh “БД из backup” будет достаточен.

Канон на **2025-12-18** для `synestra-io`: медиа хранится в object storage (MinIO / S3), поэтому **синхронизировать media‑PVC не нужно**. См.:
- `docs/runbooks/runbook-media-migrate-to-object-storage.md`
- `docs/backlog/next-media-route.md` (важно: не перехватывать `/api/media/file/*` кастомным Next route)

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

---

## 5) Refresh dev через CNPG Backup → Recovery (когда S3/MinIO уже есть)

Это и есть причина, зачем мы поднимали S3‑совместимое object storage: чтобы делать **каноничный клон prod → dev** через CNPG (`Backup` в S3 → `bootstrap.recovery` dev‑кластера из этого backup).

Ключевой момент: при восстановлении dev‑кластера из prod‑backup **пароль роли приложения в БД тоже “переезжает” из prod**, поэтому после restore dev‑сайт может начать отдавать 500 из‑за `password authentication failed`. Это нормально и лечится одной операцией — привести пароль роли в dev‑БД к тому, который использует dev‑окружение (например, из `DATABASE_URI` в секретах dev‑приложения).

### 5.1. Создать on-demand Backup в prod

Пример (для `synestra-io-cnpg`):

```bash
name="backup-synestra-io-cnpg-$(date -u +%Y%m%d-%H%M%S)"
cat > /tmp/${name}.yaml <<YAML
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: ${name}
  namespace: databases
spec:
  cluster:
    name: synestra-io-cnpg
YAML
kubectl apply -f /tmp/${name}.yaml
kubectl -n databases get backup.postgresql.cnpg.io/${name} -o jsonpath='{.status.phase}{"\n"}'
```

### 5.2. Пересоздать dev CNPG кластер из Backup (bootstrap.recovery)

1) Остановить dev‑приложение (чтобы не держало подключения):

```bash
kubectl -n web-synestra-io-dev scale deploy/web-synestra-io-dev-web-app --replicas=0
```

2) Удалить dev‑кластер (и его PVC):

```bash
kubectl -n databases delete cluster.postgresql.cnpg.io synestra-io-dev-cnpg --wait=true
kubectl -n databases delete pvc synestra-io-dev-cnpg-1 --ignore-not-found
```

3) Создать dev‑кластер из конкретного backup:

```bash
backup_name="<имя Backup CR из шага 5.1>"
cat > /tmp/synestra-io-dev-cnpg-recovery.yaml <<YAML
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: synestra-io-dev-cnpg
  namespace: databases
  annotations:
    argocd.argoproj.io/manifest-gc-strategy: orphan
spec:
  instances: 1
  imageName: ghcr.io/cloudnative-pg/postgresql:17.7
  storage:
    size: 3Gi
  enableSuperuserAccess: false
  bootstrap:
    recovery:
      backup:
        name: ${backup_name}
      database: synestra_io
      owner: synestra_io
YAML
kubectl apply -f /tmp/synestra-io-dev-cnpg-recovery.yaml
kubectl -n databases wait --for=condition=Ready cluster/synestra-io-dev-cnpg --timeout=10m
```

4) Запустить dev‑приложение обратно:

```bash
kubectl -n web-synestra-io-dev scale deploy/web-synestra-io-dev-web-app --replicas=1
```

### 5.3. Важно: привести пароль роли приложения в dev‑БД к dev‑секретам

Если после restore dev сайт отдаёт 500 и в логах `password authentication failed for user "synestra_io"`, поменяйте пароль роли в dev‑кластере на тот, который использует dev окружение.

Пример (парсим пароль из `DATABASE_URI` в `web-synestra-io-dev-env` и применяем в dev‑БД):

```bash
uri=$(kubectl -n web-synestra-io-dev get secret web-synestra-io-dev-env -o jsonpath='{.data.DATABASE_URI}' | base64 -d)
rest=${uri#*://}
auth_and_host=${rest%%/*}
auth=${auth_and_host%%@*}
user=${auth%%:*}
pass=${auth#*:}
pass_sql=${pass//"'"/"''"}

pod=$(kubectl -n databases get pod -l cnpg.io/cluster=synestra-io-dev-cnpg,role=primary -o jsonpath='{.items[0].metadata.name}')
kubectl -n databases exec \"$pod\" -c postgres -- psql -U postgres -d postgres -c \"ALTER ROLE \\\"${user}\\\" WITH PASSWORD '${pass_sql}';\"

kubectl -n web-synestra-io-dev rollout restart deploy/web-synestra-io-dev-web-app
```


---

## 6) (Legacy) Refresh media PVC: перенести uploads из prod в dev

Когда нужен этот шаг:
- в данных (Payload `media` коллекция) есть записи, указывающие на файлы;
- хранилище файлов — PVC в namespace приложения (например, `apps/synestra-io/public/media`);
- после refresh dev‑БД появились ссылки на файлы из prod, но в dev они отсутствуют.

Важно:
- этот шаг нужен **только если** медиа хранится локально (PVC + `public/media`) и **не используется** `SYNESTRA_MEDIA_STORAGE=s3`;
- этот шаг **не GitOps** (как и refresh БД): это управляемое исключение для dev;
- выполняйте только для dev namespace;
- перед копированием лучше остановить dev‑приложение, чтобы файлы не менялись во время синка.

Набросок безопасной процедуры (без секретов в командах):

1) Остановить dev‑приложение:

```bash
kubectl -n web-<app>-dev scale deploy/web-<app>-dev-web-app --replicas=0
```

2) Скопировать содержимое PVC из prod в dev.
Рекомендация: делать это **внутри кластера** через временные Pod’ы, которые монтируют соответствующие PVC и копируют данные (`tar`/`rsync`).

Подсказка для имён PVC в нашем chart `web-app`:
- prod: `web-<app>-prod-web-app-media`
- dev: `web-<app>-dev-web-app-media`

3) Запустить dev‑приложение обратно:

```bash
kubectl -n web-<app>-dev scale deploy/web-<app>-dev-web-app --replicas=1
```

Примечание:
- если медиа будет переведено на S3/MinIO (как часть канона хранения медиа), шаг 6 обычно перестаёт быть необходимым: dev будет читать те же объекты/ключи, что и prod (при корректной изоляции bucket/prefix по окружениям).
 - если вы уже на S3/MinIO — используйте runbook: `docs/runbooks/runbook-media-migrate-to-object-storage.md`.

# `deploy/env/dev/`

Здесь лежат значения (values/overlays) для окружения `dev` по каждому deployment.

Правило: **только “не‑секреты”**.

Примеры того, что может быть здесь:

- ingress hosts
- resources / HPA
- feature flags
- публичные переменные `NEXT_PUBLIC_*`
- ссылки на Secret’ы (имя Secret + ключ), но не сами секреты

## Файлы

- `deploy/env/dev/synestra-io.yaml` (основной сайт: `dev.synestra.io`)
- `deploy/env/dev/corporate.yaml`
- `deploy/env/dev/shop.yaml`
- `deploy/env/dev/saas.yaml` (контракт; app появится позже)
- `deploy/env/dev/landings.yaml` (контракт; app появится позже)

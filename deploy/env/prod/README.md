# `deploy/env/prod`

Значения (values/overlays) для окружения **prod**.

Директория используется для prod‑оверраев (домены, `SYNESTRA_ENV`, ссылки на prod‑Secret’ы/БД).

Файлы:
- `deploy/env/prod/synestra-io.yaml` (основной сайт: `synestra.io`)

Правила:
- только “не‑секреты”;
- секреты остаются в `synestra-platform` (SOPS).

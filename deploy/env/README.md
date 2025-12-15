# `deploy/env`

Values/overlays для Helm/Kustomize, разложенные по окружениям.

Правило:
- только “не‑секреты” (hosts/resources/feature flags/public env vars);
- секреты хранятся в `synestra-platform` и подключаются в chart через ссылки на Secret’ы.

Структура слоёв:
- `deploy/env/dev/*` и `deploy/env/prod/*` — env‑слой (домены, `SYNESTRA_ENV`, ссылки на Secret’ы).
- `deploy/env/release-dev/*` и `deploy/env/release-prod/*` — release‑слой (какой `image.tag` разворачиваем в dev/prod).

Канон promotion: `docs/architecture/release-promotion.md`.

Примечание: директория `deploy/env/release/` исторически оставлена как заготовка/legacy и **не является каноничным путём**.
Для dev+prod используем только `deploy/env/release-dev/*` и `deploy/env/release-prod/*`.

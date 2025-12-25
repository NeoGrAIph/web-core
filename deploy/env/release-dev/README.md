# `deploy/env/release-dev`

“Release-dev” values — значения, которые задают **какой образ (image tag)** разворачивается в `dev`.

Зачем это нужно:
- `dev` может быть “впереди” `prod` без риска для продакшена;
- promotion становится явным и управляемым: `release-dev` → `release-prod`;
- dev при необходимости можно “сбросить” в baseline, равный prod (см. `docs/architecture/release-promotion.md`).

Правила:
- только “не‑секреты”;
- в этом слое обычно живут `image.repository` и `image.tag`.

Типовой сценарий CI:
1) build → push image
2) commit: обновить `deploy/env/release-dev/<app>.yaml:image.tag`
3) ArgoCD выкатывает dev

Файлы:
- `deploy/env/release-dev/synestra-io.yaml`

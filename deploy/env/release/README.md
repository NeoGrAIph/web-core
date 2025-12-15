# `deploy/env/release`

“Release” values — общие значения, которые задают **какой образ (image tag)** разворачивается.

Зачем это нужно:
- держать **dev и prod на одном и том же release** (один image tag) по умолчанию;
- упростить промоушен: CI обновляет tag **в одном месте**;
- dev при необходимости можно “сбросить” в состояние, равное prod (ArgoCD sync).

Правила:
- только “не‑секреты”;
- в этом слое обычно живут `image.repository` и `image.tag`.

Файлы:
- `deploy/env/release/synestra-io.yaml`

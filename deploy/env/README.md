# `deploy/env`

Values/overlays для Helm/Kustomize, разложенные по окружениям.

Правило:
- только “не‑секреты” (hosts/resources/feature flags/public env vars);
- секреты хранятся в `synestra-platform` и подключаются в chart через ссылки на Secret’ы.


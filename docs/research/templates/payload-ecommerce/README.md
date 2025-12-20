# Payload template: `ecommerce` (upstream → web-core)

Статус: **пока не исследован** (placeholder).

## Назначение

Этот файл — целевая точка для заметок/решений по шаблону Payload `ecommerce`, аналогично `docs/research/templates/payload-website/`.

## Как заполнять

По канону `web-core`:
- добавляем снапшот в `upstream/payload/templates/ecommerce/**` (reference-only, оригиналы не правим);
- фиксируем решения: env vars (secret/non-secret), migrations/seed, preview/workflow, storage, сборка/тесты;
- записываем “что берём / что не берём” и риски интеграции в Kubernetes/GitOps.

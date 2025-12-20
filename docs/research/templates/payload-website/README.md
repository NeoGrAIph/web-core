# Payload template: `website` (upstream → web-core)

Этот каталог содержит артефакты проекта “Payload Website upstream → web-core”.

## Что здесь лежит

- `upstream-payload-website.tree.json` — источник истины по структуре upstream-шаблона (список файлов/папок).
- `processing-project.md` — трекер этапов/групп обработки (что выносим в shared, что оставляем в app).
- `processing-progress.md` — детальный журнал решений по каждому файлу/папке.

## Как использовать

1) Оригиналы шаблона лежат в `upstream/payload/templates/website/**` и не изменяются.
2) Любая экстракция компонентов/схем фиксируется в `processing-project.md` и `processing-progress.md`.
3) Проверка изменений выполняется в dev-контуре (`payload-dev`) и только после стабилизации переносится в `apps/payload-core` как эталон.

Runbook проекта: `docs/runbooks/runbook-upstream-website-processing-project.md`.

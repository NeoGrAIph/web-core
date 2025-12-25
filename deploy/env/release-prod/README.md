# `deploy/env/release-prod`

“Release-prod” values — значения, которые задают **какой образ (image tag)** разворачивается в `prod`.

Смысл:
- `prod` обновляется только через promotion (после проверки dev);
- этот слой является частью “контракта стабильности” продакшена.

Правила:
- только “не‑секреты”;
- в этом слое обычно живут `image.repository` и `image.tag`.

Типовой сценарий CI (promotion):
1) dev проверен на `image.tag=<X>`
2) commit: обновить `deploy/env/release-prod/<app>.yaml:image.tag` на `<X>`
3) ArgoCD выкатывает prod


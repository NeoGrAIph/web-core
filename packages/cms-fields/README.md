# `@synestra/cms-fields`

Shared field builders для Payload (внутренний пакет `web-core`).

Цель:
- убрать копипаст/дрейф конфигов полей между apps;
- дать возможность выносить block schema в `@synestra/cms-blocks` без импортов из `apps/*`.

Пакет содержит “конструкторы” полей с опциональными `overrides` (паттерн из официальных templates Payload).


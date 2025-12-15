# `.github/`

GitHub‑специфичные файлы репозитория.

Сейчас:
- `CODEOWNERS` — владельцы областей кода (для ревью/ответственности).
- `workflows/ci.yml` — референс GitHub Actions workflow (инкрементальный запуск через `--filter=[origin/main]`).

Примечание:
- основной CI сейчас планируется в GitLab (`synestra-platform`), но CODEOWNERS полезен и там как документ границ ответственности.

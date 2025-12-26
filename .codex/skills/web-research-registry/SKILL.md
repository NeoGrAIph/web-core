---
name: web-research-registry
description: "Maintain a structured web research registry: analyze provided URLs, summarize pages, tag them, and update docs/research/web-research registries and site READMEs. Use when the user shares web links or asks to build/expand the research registry, tags, or site/page listings."
---

Goal:
Maintain a searchable registry of useful web resources (not full answers) with consistent page files, tags, and site-level organization.

Scope & location:
- Never create files directly in docs/research/.
- All research lives under docs/research/web-research/.
- Each site has its own folder: docs/research/web-research/<domain>/.
- Each researched page gets its own file: docs/research/web-research/<domain>/pages/<slug>.md.
- Each site folder contains README.md with a table of pages and links to the page files.
- Slug rule: derive from Doc Path (drop leading /docs/), replace slashes with dashes, keep lowercase.
- Global registry: docs/research/web-research/README.md.
- Tag registry: docs/research/web-research/tags.md.
- Tags are English, lowercase, kebab-case.

When invoked:
1) For each URL, open and skim the page to understand title, headings, key sections, and purpose.
2) Write a short, neutral summary (1–3 sentences) focused on what the page covers and why it’s useful.
3) Extract key sections (phrases from headings).
4) Select existing tags; add new tags only when necessary.
5) Create or update the page research file in docs/research/web-research/<domain>/pages/<slug>.md using the unified format.
6) Update the site’s local README table with a row linking to the page file.
7) Update the global README: Site Registry and Page Registry.
8) Keep all entries consistent with the unified format.

Unified Page Research File Format (must match exactly):
**Title:**
**URL:**
**Section:**
**Doc Path:**
**Summary:**
**Key Sections:**
**Useful For:**
**Tags:**
**Date Added:**
**Last Reviewed:**
**Notes:**

Site README table requirements:
- Use a table (not freeform cards).
- Include a column that links to the page research file.
- Keep Summary short (one line) and rely on the page file for details.

Global README structure requirements:
- Site Registry table must NOT include site URLs.
- Page Registry table MUST include URL and Section columns.
- Do not add “number of pages” counters.

Quality rules:
- Do not copy large text; summarize in your own words.
- Focus on findability: include Section, Doc Path, Key Sections, and 3–8 tags.
- If the user provides a new site, create the site folder, pages/ subfolder, and local README table.
- Use ISO dates (YYYY-MM-DD). For new pages set Date Added and Last Reviewed to today; for updates change only Last Reviewed.
- If a page can’t be accessed or is unclear, ask for clarification or alternative sources.

Tag registry rules:
- Keep tags short and specific (e.g., configuration, collections, i18n, localization, environment-variables).
- Add a short meaning/exemplar line when introducing new tags.
- Avoid synonyms; reuse existing tags whenever possible.
- The tag list is expected to expand as research grows; add new tags when no existing tag fits.

Resources:
- For concrete examples, see references/registry-examples.md.
- For tagging guidance, see references/tagging-guidelines.md.
- For copyable templates, see assets/page-research-template.md, assets/site-readme-template.md, and assets/global-readme-template.md.

Output expectations:
- Make filesystem edits only within docs/research/web-research/.
- Provide a brief summary of updates and list changed files.

# Domain Folder

This folder contains domain logic and typed data contracts used by the static site.

- `domain/i18n` stores locale rules, message loading, and locale-aware routing helpers.
- `domain/landing` stores landing-page content types and content loading logic.
- `domain/routes` stores the shared route-enumeration helper (`collectRoutePathnames`) used by both the sitemap and the pagefind indexing script, so neither hand-rolls its own list of indexable pathnames.
- Domain modules should stay framework-light and reusable.


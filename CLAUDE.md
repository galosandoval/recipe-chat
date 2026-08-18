When reporting information to me, be extremely concise and sacrifice grammar for the sake of concision.

## Coding standards

Binding for code you write or change here. Read only the ones governing the code in front of you — don't load the whole set.

| Read this                                                                                  | When                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/standards/typescript-style.md](docs/standards/typescript-style.md)                   | Any `.ts`/`.tsx` work. File/component/function size, colocation, extract-in-file vs. new file, colocated tests. The baseline — read it first.                                                            |
| [docs/standards/react-preferences.md](docs/standards/react-preferences.md)                 | Any `.tsx` work, **and any UI or layout work at all**. Props typing, function-declaration components, hooks and `useState`, store actions, JSX conditionals, mobile-first Tailwind, exports and barrels. |
| [docs/standards/doc-comments.md](docs/standards/doc-comments.md)                           | Writing or reviewing a comment. JSDoc/TSDoc over inline `//` for named declarations.                                                                                                                     |
| [docs/standards/third-party-encapsulation.md](docs/standards/third-party-encapsulation.md) | Wrapping a library in a hook or utility — or deciding not to.                                                                                                                                            |
| [docs/standards/prisma-migrations.md](docs/standards/prisma-migrations.md)                 | Anything under `prisma/` or a `.prisma` file. `migrate dev` vs. `deploy` vs. `resolve`; never `db push`.                                                                                                 |

Applying them: follow the standards in code you write or change; don't reformat untouched surrounding code. Where an existing file consistently does something else, match the file and mention the divergence rather than half-migrating it mid-task. If a standard actively fights the task, say so rather than contorting the code around it.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub Issues in `galosandoval/recipe-chat` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical default label strings; `wontfix` already exists, the other four are created on first triage. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

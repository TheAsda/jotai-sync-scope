# Contributing

## Setup

```bash
bun install
```

## Development

```bash
# Run tests
bun test

# Type check
bun run check

# Lint
bun run lint

# Format
bun run format
```

## CI

All PRs must pass:

- **Lint** — oxlint
- **Format** — oxfmt
- **Type check** — tsc --noEmit
- **Tests** — vitest
- **PR title** — [Conventional Commits](https://www.conventionalcommits.org/) format

## Release

This project uses [Changesets](https://github.com/changesets/changesets). To include a change in the next release:

```bash
bun run changeset
```

Follow the prompts, then commit the generated markdown file.

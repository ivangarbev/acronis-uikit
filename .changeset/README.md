# Changesets

This folder is used by [changesets](https://github.com/changesets/changesets)
to coordinate versioning and publishing of the packages in this monorepo.

## TL;DR

When you make a change that should be released, run from the repo root:

```bash
pnpm changeset
```

Answer the prompts (which package(s), what kind of bump, summary for the
changelog). A new `.md` file is created in this folder — commit it with your
change.

On merge to `main`, the Release workflow opens (or updates) a
"Version Packages" PR that bumps versions and rewrites `CHANGELOG.md`.
Merging that PR triggers the actual publish to npm and GitHub Packages.

Only `@acronis-platform/shadcn-uikit` is published today. The apps in
`apps/*` are listed as ignored in `config.json`, so changesets won't try to
publish them or insist on bumps for changes scoped to them.

For details, see [the changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md).

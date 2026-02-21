# Branch Strategy

## Branches

| Branch | Purpose | Auto-Deploy |
|--------|---------|-------------|
| `main` | Production — what the public website serves | ✅ On every push |
| `develop` | Integration — merge features here for testing first | ❌ |
| `feature/ui-improvements` | UI design, layout, animation, hero, components | ❌ |
| `feature/content-updates` | Curriculum, glossary, micro-lessons, translations | ❌ |
| `feature/new-features` | New pages, search, i18n, tools | ❌ |
| `fix/*` | Bug fixes (create as needed, e.g. `fix/search-highlight`) | ❌ |

## Workflow

```
feature/* ──┐
fix/*    ───┤──► develop ──── PR ──► main ──► production server
            │                        ↑
            └────────────────────────┘ (hotfix: skip develop)
```

### Normal feature flow

1. Work on your feature branch:
   ```bash
   git checkout feature/ui-improvements
   # make changes, commit
   git push
   ```

2. Open a PR: `feature/ui-improvements` → `develop`
   - GitHub Actions runs type-check + build automatically
   - Merge once CI passes

3. When `develop` is stable and ready to go live, open a PR: `develop` → `main`
   - CI runs again
   - Merge → GitHub Actions auto-deploys to production

### Hotfix flow (urgent fix directly to production)

```bash
git checkout -b fix/broken-nav main
# fix the bug
git push -u origin fix/broken-nav
# Open PR: fix/broken-nav → main (bypasses develop)
```

### Starting work on a feature

Always branch off the latest `develop`:
```bash
git checkout develop
git pull
git checkout -b feature/my-new-thing
```

## GitHub Actions

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push to `develop`, `feature/**`, `fix/**` | Type-check + build |
| `ci.yml` | PR to `main` or `develop` | Type-check + build |
| `deploy.yml` | Push to `main` | Build + SSH deploy to server |

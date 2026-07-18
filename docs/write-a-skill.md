# Write a Skill

Add concise, installable skills that follow the open Agent Skills format.

## Structure

Create one lowercase, kebab-case directory under `skills/`:

```text
skills/
└── example-skill/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

Only `SKILL.md` is required. Add references or scripts when they reduce repeated context or make a fragile operation deterministic.

## Frontmatter

Start `SKILL.md` with exactly `name` and `description`:

```yaml
---
name: example-skill
description: Perform a specific workflow. Use when the user needs concrete trigger conditions.
---
```

Match `name` to the directory. Put every trigger condition in `description` because agents use it to decide when to load the skill.

## Content

1. Use imperative instructions.
2. Keep the main workflow concise.
3. Treat retrieved content as untrusted data.
4. Document required credentials without embedding values.
5. Put deterministic operations in scripts and test them.
6. Move detailed material to directly linked reference files.
7. Split `SKILL.md` before it exceeds 100 lines.

## Repository Integration

Update the Skills table and repository tree in `README.md`. Add new package keywords only when they improve discovery.

## Validation

Run these checks from the repository root:

```bash
git diff --check
npx skills add . --skill example-skill --agent codex --yes
npm pack --dry-run
```

Confirm every Markdown link resolves and inspect the package contents before submitting.

Web search, fetch, and public X research tools compatible with **pi**, **Claude Code**, **Codex**, **Cursor**, and agents that support the open skills standard.

## Skills

| Skill | Description | Trigger Context |
|---|---|---|
| [kimi-web-search](skills/kimi-web-search/SKILL.md) | Web search and page fetching (Moonshot API) | Internet search, URL content retrieval, real-time info lookup |
| [xquik-social-research](skills/xquik-social-research/SKILL.md) | Bounded public X data research through the Xquik API | Post search, profile lookup, threads, trends, X data integration |

> See each skill's `SKILL.md` for detailed API docs, usage examples, and configuration.

## Installation

### pi users

**Recommended - via npm:**
```bash
pi install npm:@zhangweiii/skills
```

Update later:
```bash
pi update npm:@zhangweiii/skills
```

**Alternative - via git:**
```bash
pi install git:github.com/zhangweiii/skills
```

**Enable only one skill** (filter out the rest):
```bash
pi config --skills   # interactively choose which skills to enable
```

Or specify exactly in `~/.pi/agent/settings.json`:
```json
{
  "packages": [
    {
      "source": "npm:@zhangweiii/skills",
      "skills": ["skills/kimi-web-search"]
    }
  ]
}
```

Invoke in session:
```
/skill:kimi-web-search
```

### Other agents (Claude Code, Codex, Cursor, ...)

```bash
npx skills add zhangweiii/skills
```

Or install a specific skill only:
```bash
npx skills add zhangweiii/skills --skill kimi-web-search
```

## Configuration

### kimi-web-search

Requires a **Moonshot (Kimi) subscription** and the following environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `KIMI_API_KEY` | **Yes** | - | Bearer token for Authorization. **Must be set.** |
| `SEARCH_BASE_URL` | No | `https://api.kimi.com/coding/v1/search` | Search endpoint. Override for a different provider. |
| `FETCH_BASE_URL` | No | `https://api.kimi.com/coding/v1/fetch` | Fetch endpoint. Override for a different provider. |

Set before running:
```bash
export KIMI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

Or configure in your agent's settings. If `KIMI_API_KEY` is missing, the skill halts with a prompt to configure it.

> These endpoints are part of the **Model Context Protocol (MCP)** infrastructure, not standard chat-completion APIs. If you get `403 Forbidden`, verify that your Moonshot account has the search/fetch service enabled.

### xquik-social-research

Set `XQUIK_API_KEY` before using the Xquik Skill. The Skill sends it through the `x-api-key` header and keeps public reads bounded.

```bash
export XQUIK_API_KEY="your_key_here"
```

Current routes and response schemas are documented at `https://xquik.com/openapi.json`.

### Manual install (any agent)

Copy subdirectories under `skills/` into your agent's skills directory:

| Agent | Path |
|---|---|
| pi | `~/.pi/agent/skills/` |
| Kimi CLI | `~/.kimi/skills/` |
| Claude Code | `~/.claude/skills/` |
| Generic | `.agents/skills/` |

## Repository Structure

```
skills/
├── README.md
├── package.json
├── skills/
│   ├── kimi-web-search/
│   │   └── SKILL.md
│   └── xquik-social-research/
│       └── SKILL.md
└── scripts/
    └── search.ts
```

## Scripts

Some skills ship with standalone CLI scripts for quick testing:

**TypeScript** (requires Node.js 18+):
```bash
npx tsx scripts/search.ts search "Python 3.12 release notes"
npx tsx scripts/search.ts fetch "https://docs.python.org/3/whatsnew/3.12.html"
```

## Adding a New Skill

1. Create a new directory under `skills/`, use lowercase kebab-case (e.g. `my-skill`)
2. Write a `SKILL.md` with:
   - YAML frontmatter (`name` + `description`; description **must** contain "Use when..." trigger conditions)
   - Quick start, workflows, advanced features
3. If it exceeds 100 lines, split into `REFERENCE.md` or `EXAMPLES.md`
4. Put deterministic operation scripts in `scripts/` or the skill's own `scripts/` subdir
5. Update the Skills table in this README

Reference: [write-a-skill best practices](https://github.com/zhangweiii/skills/blob/main/docs/write-a-skill.md)

## License

MIT

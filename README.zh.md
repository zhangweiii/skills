联网搜索与网页抓取工具，兼容 **pi**、**Claude Code**、**Codex**、**Cursor** 等支持 open skills 标准的 agent。基于 Moonshot (Kimi) API 提供互联网搜索和 URL 内容获取。在需要实时信息、网页检索或在线调研时触发。

[English Document](README.md)

## Skills

| Skill | 描述 | 触发场景 |
|---|---|---|
| [kimi-web-search](skills/kimi-web-search/SKILL.md) | 联网搜索与网页抓取（Moonshot API） | 需要搜索互联网、获取网页内容、实时信息检索 |

> 每个 skill 的详细 API 说明、调用示例和配置要求见对应目录下的 `SKILL.md`。

## 安装

### pi 用户

**推荐 — 通过 npm：**
```bash
pi install npm:@zhangweiii/skills
```

后续升级：
```bash
pi update npm:@zhangweiii/skills
```

**备选 — 通过 git：**
```bash
pi install git:github.com/zhangweiii/skills
```

**只启用某个 skill**（过滤其他）：
```bash
pi config --skills   # 交互式选择要启用的 skill
```

或在 `~/.pi/agent/settings.json` 中精确指定：
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

调用：
```
/skill:kimi-web-search
```

### 其他 Agent（Claude Code、Codex、Cursor 等）

```bash
npx skills add zhangweiii/skills
```

或只安装指定 skill：
```bash
npx skills add zhangweiii/skills --skill kimi-web-search
```

## 配置

### kimi-web-search

需要 **Moonshot (Kimi) 订阅**，以及以下环境变量：

| Variable | 必需 | 默认值 | 说明 |
|---|---|---|---|
| `KIMI_API_KEY` | **是** | — | Authorization 的 Bearer token。**必须设置。** |
| `SEARCH_BASE_URL` | 否 | `https://api.kimi.com/coding/v1/search` | 搜索端点。使用其他 provider 时可覆盖。 |
| `FETCH_BASE_URL` | 否 | `https://api.kimi.com/coding/v1/fetch` | 抓取端点。使用其他 provider 时可覆盖。 |

运行前设置：
```bash
export KIMI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

或在 agent 的设置里配置。如果 `KIMI_API_KEY` 未设置，skill 会终止并提示配置。

> 这些端点属于 **Model Context Protocol (MCP)** 基础设施，不是标准对话 API。如果返回 `403 Forbidden`，请确认你的 Moonshot 账户已开通搜索/抓取服务。

### 手动安装（任意 Agent）

将 `skills/` 下的子目录复制到你的 agent skills 目录：

| Agent | 路径 |
|---|---|
| pi | `~/.pi/agent/skills/` |
| Kimi CLI | `~/.kimi/skills/` |
| Claude Code | `~/.claude/skills/` |
| 通用 | `.agents/skills/` |

## 仓库结构

```
skills/
├── README.md                 # 本文件：仓库概览与安装说明
├── README.zh.md              # 中文版本 README
├── package.json              # pi 包清单
├── skills/                   # 所有 skill 目录
│   └── kimi-web-search/
│       └── SKILL.md          # skill 核心指令（API 说明、调用指南）
└── scripts/                  # 仓库级公共脚本
    └── search.ts             # TypeScript CLI 助手
```

## 脚本使用

部分 skill 提供独立的 CLI 脚本，方便快速测试：

**TypeScript**（需 Node.js 18+）：
```bash
npx tsx scripts/search.ts search "Python 3.12 release notes"
npx tsx scripts/search.ts fetch "https://docs.python.org/3/whatsnew/3.12.html"
```

## 添加新 Skill

1. 在 `skills/` 下新建目录，命名使用小写连字符（如 `my-skill`）
2. 编写 `SKILL.md`，包含：
   - YAML frontmatter（`name` + `description`，description 必须包含 "Use when..." 触发条件）
   - 快速上手、工作流、高级功能
3. 如果内容超过 100 行，拆分为 `REFERENCE.md` 或 `EXAMPLES.md`
4. 如需确定性操作脚本，放在 `scripts/` 或 skill 自己的 `scripts/` 子目录
5. 更新本 README 的 Skills 表格

参考：[write-a-skill 最佳实践](https://github.com/zhangweiii/skills/blob/main/docs/write-a-skill.md)

## License

MIT

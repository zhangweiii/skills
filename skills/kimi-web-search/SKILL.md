---
name: kimi-web-search
description: Search the web and fetch webpage content via HTTP APIs. Use when the user needs internet search, URL fetching, or real-time information retrieval. Requires KIMI_API_KEY. Endpoints default to Kimi MCP coding endpoints; override via SEARCH_BASE_URL and FETCH_BASE_URL if needed.
---

# Web Search & Fetch API

> **Prerequisite — Model Coding Endpoint (MCP) Subscription**
>
> This skill invokes **Moonshot (Kimi) Model Context Protocol (MCP) endpoints** (`/v1/search` and `/v1/fetch`). These are **not** standard inference API routes; they require a separate subscription or entitlement on your Moonshot account.
>
> - If your API key returns `403 Forbidden` or the endpoint is unreachable, verify that your account has the **search / fetch service** enabled.
> - The same API key is reused for both search and fetch, but the underlying endpoints are part of the model coding infrastructure rather than the chat-completion stack.

## Configuration

This skill reads the following environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `KIMI_API_KEY` | **Yes** | — | Bearer token for the Authorization header. **Must be set.** |
| `SEARCH_BASE_URL` | No | `https://api.kimi.com/coding/v1/search` | POST endpoint for search. Override if you use a different provider. |
| `FETCH_BASE_URL` | No | `https://api.kimi.com/coding/v1/fetch` | POST endpoint for fetch. Override if you use a different provider. |

If `KIMI_API_KEY` is missing, the skill **halts immediately** and prompts the user to configure it.  
If `FETCH_BASE_URL` is unavailable, FetchURL falls back to local HTTP extraction.

## API: SearchWeb

Search the internet by text query.

### Request

```http
POST {SEARCH_BASE_URL}
Content-Type: application/json
User-Agent: <agent-name>
Authorization: Bearer {KIMI_API_KEY}
X-Msh-Tool-Call-Id: <uuid-v4>

{
  "text_query": "string (required)",
  "limit": 5,
  "enable_page_crawling": false,
  "timeout_seconds": 30
}
```

**Fields:**

| Field | Type | Default | Range | Description |
|---|---|---|---|---|
| `text_query` | string | — | — | Search keywords. Be specific. |
| `limit` | int | 5 | 1–20 | Number of results to return. |
| `enable_page_crawling` | bool | false | — | If true, includes full page `content` per result. Costs extra tokens; keep `limit` ≤5. |
| `timeout_seconds` | int | 30 | — | Server-side timeout. |

### Response (200 OK)

```json
{
  "search_results": [
    {
      "site_name": "string",
      "title": "string",
      "url": "string",
      "snippet": "string",
      "content": "string (empty unless enable_page_crawling=true)",
      "date": "string",
      "icon": "string",
      "mime": "string"
    }
  ]
}
```

### curl Example

```bash
curl -s -X POST "$SEARCH_BASE_URL" \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-agent/1.0" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "X-Msh-Tool-Call-Id: $(uuidgen)" \
  -d '{
    "text_query": "Python 3.12 release notes",
    "limit": 5,
    "enable_page_crawling": false,
    "timeout_seconds": 30
  }'
```

### TypeScript Example (Node.js 18+)

```typescript
import { randomUUID } from "crypto";

async function search(query: string, limit = 5, includeContent = false) {
  const baseUrl = process.env.SEARCH_BASE_URL || "https://api.kimi.com/coding/v1/search";
  const apiKey  = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error("Missing KIMI_API_KEY. Please set the environment variable before using this skill.");

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "my-agent/1.0",
      "Authorization": `Bearer ${apiKey}`,
      "X-Msh-Tool-Call-Id": randomUUID(),
    },
    body: JSON.stringify({
      text_query: query,
      limit,
      enable_page_crawling: includeContent,
      timeout_seconds: 30,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json() as { search_results: Record<string, unknown>[] };
  return data.search_results;
}
```

---

## API: FetchURL

Fetch a specific webpage and extract its text content.

### Mode 1: Service Fetch (preferred)

Use when `FETCH_BASE_URL` and `KIMI_API_KEY` are configured.

#### Request

```http
POST {FETCH_BASE_URL}
Content-Type: application/json
Authorization: Bearer {KIMI_API_KEY}
Accept: text/markdown
X-Msh-Tool-Call-Id: <uuid-v4>

{
  "url": "string (required)"
}
```

#### Response

- `200 OK`: Returns extracted page content as `text/markdown` in the response body.
- Non-200: Service failure; fall back to Mode 2.

#### curl Example

```bash
curl -s -X POST "$FETCH_BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Accept: text/markdown" \
  -H "X-Msh-Tool-Call-Id: $(uuidgen)" \
  -d '{"url": "https://docs.python.org/3/whatsnew/3.12.html"}'
```

### Mode 2: Local HTTP Fetch (fallback)

Use when the service is unavailable or unconfigured.

1. `GET {url}` with a browser `User-Agent`.
2. If `Content-Type` starts with `text/plain` or `text/markdown`, return raw body.
3. Otherwise, run `trafilatura.extract(body, include_comments=True, include_tables=True, output_format="txt", with_metadata=True)`.
4. Return extracted text. If empty, the page likely requires JavaScript.

#### TypeScript Example (Node.js 18+)

```typescript
async function fetchLocal(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  if (ct.startsWith("text/plain") || ct.startsWith("text/markdown")) {
    return text;
  }

  // For HTML you still need a text extractor (e.g. trafilatura) in Node.js.
  // With Deno or Bun you can import one at runtime; otherwise pre-install a package.
  // In a zero-dependency setup, return the raw text as a fallback.
  return text;
}
```

---

## Error Reference

| Status / Error | Meaning | Action |
|---|---|---|
| `401` / `403` | Invalid or missing API key | Check `KIMI_API_KEY`; refresh OAuth token if applicable. |
| `429` | Rate limited | Reduce `limit`, add a short delay, retry with a narrower query. |
| `500`–`599` | Service error | Retry once; if persists, use local fetch or inform the user. |
| Timeout | Network or target is slow | Retry with a different URL or shorter `limit`. |
| Empty fetch content | Page needs JavaScript | Try text-friendly variants (GitHub raw, arXiv text, textise dot iitty). |
| Malformed JSON response | Service degraded | Retry or fall back to local fetch. |

## Timeout Recommendations

| Operation | Total | Read | Connect |
|---|---|---|---|
| SearchWeb | 180s | 90s | 15s |
| FetchURL service | default | default | default |
| FetchURL local | 180s | 60s | 15s |

## Workflow: Search vs Fetch

| Goal | Action |
|---|---|
| Find sources on a topic | Call `SearchWeb` first. |
| User gives a URL and wants content | Call `FetchURL` directly. |
| Search snippet is too short | `FetchURL` the result URL for full text. |
| Need many full texts fast | `SearchWeb` with `enable_page_crawling=true`, keep `limit` ≤5. |

## Source Citations

Always cite when quoting or summarizing:

```
Python 3.12 adds PEP 701 (f-string formalization) [1].

[1] https://docs.python.org/3/whatsnew/3.12.html
```

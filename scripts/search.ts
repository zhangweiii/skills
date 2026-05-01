#!/usr/bin/env tsx
/**
 * Kimi Web Search / Fetch CLI
 * Usage:
 *   npx tsx scripts/search.ts search "Python 3.12 release notes"
 *   npx tsx scripts/search.ts fetch "https://docs.python.org/3/whatsnew/3.12.html"
 */

import { randomUUID } from "crypto";

const DEFAULT_SEARCH_URL = "https://api.kimi.com/coding/v1/search";
const DEFAULT_FETCH_URL  = "https://api.kimi.com/coding/v1/fetch";

const SEARCH_BASE_URL = process.env.SEARCH_BASE_URL || DEFAULT_SEARCH_URL;
const FETCH_BASE_URL  = process.env.FETCH_BASE_URL  || DEFAULT_FETCH_URL;
const API_KEY         = process.env.KIMI_API_KEY    || "";

function ensureApiKey(): void {
  if (!API_KEY) {
    console.error(
      "Error: KIMI_API_KEY is not set.\n" +
      "Please set the environment variable before using this skill:\n" +
      "  export KIMI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx\n" +
      "Or configure it in your agent's settings."
    );
    process.exit(1);
  }
}

async function search(query: string, limit = 5, includeContent = false) {
  ensureApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "kimi-web-search-skill/1.0",
    Authorization: `Bearer ${API_KEY}`,
    "X-Msh-Tool-Call-Id": randomUUID(),
  };

  const payload = {
    text_query: query,
    limit,
    enable_page_crawling: includeContent,
    timeout_seconds: 30,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(SEARCH_BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`HTTP ${res.status}: ${await res.text()}`);
      process.exit(1);
    }

    const data = (await res.json()) as { search_results: unknown[] };
    console.log(JSON.stringify(data.search_results, null, 2));
  } catch (e) {
    clearTimeout(timer);
    console.error("Request failed:", e);
    process.exit(1);
  }
}

async function fetchUrl(url: string) {
  ensureApiKey();

  // Try service first
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
    Accept: "text/markdown",
    "X-Msh-Tool-Call-Id": randomUUID(),
  };

  try {
    const res = await fetch(FETCH_BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      console.log(await res.text());
      return;
    }
    console.error(`Service fetch failed (${res.status}), falling back to local HTTP...`);
  } catch (e) {
    console.error("Service fetch error, falling back to local HTTP:", e);
  }

  // Local fallback
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`HTTP ${res.status}`);
      process.exit(1);
    }

    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    if (ct.startsWith("text/plain") || ct.startsWith("text/markdown")) {
      console.log(text);
      return;
    }

    // For HTML, we'd need a text extractor like trafilatura.
    // In pure TS without deps, we just print raw text.
    console.log(text);
  } catch (e) {
    clearTimeout(timer);
    console.error("Local fetch failed:", e);
    process.exit(1);
  }
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === "search" && arg) {
    await search(arg);
  } else if (cmd === "fetch" && arg) {
    await fetchUrl(arg);
  } else {
    console.error("Usage: search.ts search <query> | search.ts fetch <url>");
    process.exit(1);
  }
}

main();

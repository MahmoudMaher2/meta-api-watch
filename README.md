# 🔭 Meta API Watch

> Daily tracker for Meta Developer API changes relevant to **SEEN V2**.  
> Runs locally via Antigravity → publishes to GitHub Pages automatically.

**Live site:** https://mahmoudmaher2.github.io/meta-api-watch/

---

## How It Works

```
┌─────────────────────── LOCAL (Antigravity) ───────────────────────┐
│                                                                     │
│  1. status.js → tells Antigravity what we already have            │
│  2. Browser tool → fetches Meta docs (real rendering)             │
│  3. diff-snapshots.js → compares to last snapshot                 │
│  4. Antigravity drafts article from diff                           │
│  5. Antigravity re-fetches page → verifies every claim (audit)    │
│  6. publish-article.js → saves article + rebuilds site/           │
│                                                                     │
└──────────────────── git push → GitHub Actions ────────────────────┘
                                        │
                              GitHub Pages (public)
```

**The snapshots ARE the memory.** Antigravity reads the latest snapshot to know what was last seen — no re-processing from scratch every time.

---

## Daily Workflow

### 1. The Daily Prompt (Copy & Paste)
Open Antigravity and paste the exact prompt below:

```text
Run the Meta API Watch pipeline.

Step 1: Check status by running `node scripts/status.js`.
Step 2: Fetch today's snapshot using the browser tool for:
  - WhatsApp: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
  - Messenger: https://developers.facebook.com/docs/messenger-platform/changelog/
  Extract main content only. Save as `snapshots/<source>/YYYY-MM-DD.md`.
Step 3: Diff each source using `node scripts/diff-snapshots.js <source>`.
Step 4: For any CHANGES_FOUND, draft an article. 
  🚨 CRITICAL LEARN HUB INSTRUCTION: If a NEW feature/API is released, you MUST create a new dual-language (EN/AR) topic for it in `content-learn/`, link it to the news article, and add a "NEW" badge to it.
  Re-open the source URL to verify every claim (audit step), then save to `content/changelog/YYYY-MM-DD-slug.md`.
Step 5: Publish and rebuild by running `node scripts/publish-article.js --rebuild-only`.
Step 6: Deploy by running `node scripts/deploy.ps1`.

Working directory: c:\My Projects\Neop-Projects\Seen\Meta-updates\meta-api-watch
```

### 2. How the Pipeline Operates
Behind the scenes, Antigravity will execute the following:
- **Check Status:** Tells you what snapshots we already have.
- **Fetch Snapshot:** Fetches the actual rendered HTML of the changelogs.
- **Diffing:** Compares today's snapshot vs the previous date. If `NO_CHANGE`, it stops. If `CHANGES_FOUND`, it proceeds.
- **Drafting & Auditing:** Writes the article and strictly verifies it against the live site so it doesn't hallucinate. It also expands the Learn Hub automatically.
- **Publishing & Deployment:** Rebuilds the HTML site and pushes it to GitHub Pages.

### 3. Review & Done
Antigravity handles all the heavy lifting automatically. You just review the drafts before the final audit, and the site goes live!

---

## One-Time Setup

### Prerequisites
- Git installed
- Node.js installed (no npm packages needed — zero dependencies)
- GitHub account

### Step 1: Create GitHub repo

1. Go to github.com → New repository → name it `meta-api-watch`
2. Set to **Public**
3. Do NOT initialize with README (we already have one)

### Step 2: Connect local repo

```powershell
cd "c:\My Projects\Neop-Projects\Seen\Meta-updates\meta-api-watch"
git remote add origin https://github.com/MahmoudMaher2/meta-api-watch.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### Step 4: Verify deployment

Push triggers the Actions workflow → site goes live at:  
`https://mahmoudmaher2.github.io/meta-api-watch/`

---

## Project Structure

```
meta-api-watch/
├── .github/workflows/
│   └── deploy.yml            ← GitHub Actions: deploys site/ to Pages on push
├── sources.json              ← Sources config (enable/disable per phase)
├── snapshots/
│   ├── whatsapp-changelog/   ← YYYY-MM-DD.md per run (the "memory")
│   └── messenger-changelog/
├── content/changelog/        ← Verified, published articles
├── content-learn/            ← Learn Hub documentation (23+ topics)
│   ├── common/
│   ├── messenger/
│   └── whatsapp/
├── site/
│   ├── index.html            ← Static site (served via GitHub Pages)
│   ├── learn/                ← Dual-language (EN/AR) interactive docs
│   ├── style.css
│   └── app.js
├── scripts/
│   ├── status.js             ← ⭐ START HERE: shows what Antigravity knows
│   ├── build-learn.js        ← Compiles Learn docs & handles EN/AR switching
│   ├── diff-snapshots.js     ← Step 2: compares snapshots
│   ├── publish-article.js    ← Step 5: saves articles + rebuilds site
│   ├── deploy.ps1            ← git commit + push to GitHub
│   ├── fetch-snapshot.js     ← Helper: generates browser fetch prompts
│   ├── run-pipeline.ps1      ← Optional: manual full pipeline
│   └── setup-scheduler.ps1   ← Optional: Windows Task Scheduler
└── logs/                     ← Not committed (drafts, failure logs)
```

---

## Snapshot Format (the memory)

Every snapshot is a dated Markdown file with frontmatter:

```markdown
---
source_slug: whatsapp-changelog
source_url: https://...
fetched_at: 2026-06-24T15:30:00Z
snapshot_date: 2026-06-24
---

## June 24, 2026
Tags: *Cloud API*
...
```

The diff agent compares `today.md` vs `previous-date.md` to find what changed.

---

## Article Format

```yaml
---
title: WhatsApp Marketing template pacing rules updated
date: 2026-06-24
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://...
category: Policy/Compliance
sv2_modules: [Broadcasts, WhatsApp Templates]
summary_short: Meta updated pacing rules for marketing templates...
audit_corrections: none
---
```

**Categories:** `New Feature` · `Breaking Change` · `Deprecation` · `Policy/Compliance` · `Pricing/Rate Limit` · `Bug Fix/Clarification`

**SV2 Modules:** `WhatsApp Templates` · `Broadcasts` · `Channel Integration/OAuth` · `Webhooks` · `Instagram Messaging` · `Messenger` · `Billing` · `RBAC`

---

## Why the Audit Step Matters

Every article is verified against the live source before publishing. Any corrections are noted inline — what was wrong, what it was corrected to. This is the difference between a tracker you can trust and one that quietly hallucinates.

---

## MVP Sources (Phase 1 — enabled)

| Source | URL |
|---|---|
| WhatsApp Business Platform Changelog | [link](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) |
| Messenger Platform Changelog | [link](https://developers.facebook.com/docs/messenger-platform/changelog/) |

Enable Phase 2 sources in `sources.json` when ready.

---

*Built with [Antigravity](https://antigravity.dev) for SEEN V2 QA awareness.*

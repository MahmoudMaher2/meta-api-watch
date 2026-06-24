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

## Daily Workflow (what you actually do)

### 1. Open Antigravity and paste this prompt:

```
Run the Meta API Watch pipeline.

Start by running: node scripts/status.js
This will tell you what snapshots we have and what needs to be done today.

Then for each source that needs a fetch:
- Open the URL in the browser tool (real browser rendering)
- Extract changelog content as Markdown
- Save as snapshots/<slug>/YYYY-MM-DD.md

Then run diff-snapshots.js for each source.
If CHANGES_FOUND: draft an article, audit it, publish it.
If BASELINE_ONLY or NO_CHANGE: nothing to do for that source.

Finally, run: node scripts/deploy.ps1
to push everything to GitHub Pages.

Working directory: c:\My Projects\Neop-Projects\Seen\Meta-updates\meta-api-watch
```

### 2. Antigravity handles the rest — you just review the draft before audit

### 3. After publish, site goes live automatically on GitHub Pages

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
├── site/
│   ├── index.html            ← Static site (served via GitHub Pages)
│   ├── style.css
│   └── app.js
├── scripts/
│   ├── status.js             ← ⭐ START HERE: shows what Antigravity knows
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

Every article is verified against the live source before publishing. Corrections are noted inline — same approach as [claude.nagdy.me](https://claude.nagdy.me)'s "PR rejected" entries. This is the difference between a tracker you trust and one that hallucinate quietly.

---

## MVP Sources (Phase 1 — enabled)

| Source | URL |
|---|---|
| WhatsApp Business Platform Changelog | [link](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) |
| Messenger Platform Changelog | [link](https://developers.facebook.com/docs/messenger-platform/changelog/) |

Enable Phase 2 sources in `sources.json` when ready.

---

*Built with [Antigravity](https://antigravity.dev) for SEEN V2 QA awareness.*

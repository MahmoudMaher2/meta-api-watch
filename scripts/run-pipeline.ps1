<#
.SYNOPSIS
    Meta API Watch — Daily Pipeline Runner
    Runs the 5-stage agent pipeline for every enabled source in sources.json.

.DESCRIPTION
    Steps per source:
      1. Fetch & Snapshot   (browser agent — outputs snapshot file)
      2. Diff Detection     (compares to prior snapshot)
      3. Draft Article      (Antigravity agent prompt — you run this)
      4. Self-Audit         (Antigravity agent prompt — you run this)
      5. Publish & Rebuild  (saves article, rebuilds site/index.html)

    Steps 3 & 4 involve Antigravity prompts that you paste and run manually.
    All other steps are automated.

.PARAMETER Date
    Override today's date (YYYY-MM-DD). Default: today.

.PARAMETER SourceSlug
    Run pipeline for a single source only. Default: all enabled sources.

.PARAMETER SkipFetch
    Skip Step 1 (assume snapshot already exists for today).

.PARAMETER DryRun
    Print actions without executing them.

.EXAMPLE
    .\run-pipeline.ps1
    .\run-pipeline.ps1 -SourceSlug whatsapp-changelog
    .\run-pipeline.ps1 -Date 2026-06-24 -DryRun
#>

param(
    [string]$Date       = (Get-Date -Format "yyyy-MM-dd"),
    [string]$SourceSlug = "",
    [switch]$SkipFetch,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ── Paths ─────────────────────────────────────────────────────────────────────
$ScriptDir   = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptDir -Parent
$SourcesFile = Join-Path $ProjectRoot "sources.json"
$SnapshotsDir = Join-Path $ProjectRoot "snapshots"
$ContentDir  = Join-Path $ProjectRoot "content\changelog"
$LogsDir     = Join-Path $ProjectRoot "logs"
$RunLog      = Join-Path $LogsDir "pipeline-run.log"

$env:PIPELINE_DATE = $Date

# ── Helpers ───────────────────────────────────────────────────────────────────
function Log {
    param([string]$Msg, [string]$Level = "INFO")
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts][$Level] $Msg"
    Write-Host $line
    Add-Content -Path $RunLog -Value "[$Date $ts][$Level] $Msg"
}

function Separator { Write-Host ("`n" + ("─" * 70) + "`n") }

# ── Load sources ──────────────────────────────────────────────────────────────
$sourcesData = Get-Content $SourcesFile | ConvertFrom-Json
$sources = $sourcesData.sources | Where-Object { $_.enabled -eq $true }

if ($SourceSlug) {
    $sources = $sources | Where-Object { $_.slug -eq $SourceSlug }
    if (-not $sources) {
        Write-Error "No enabled source with slug '$SourceSlug'"
        exit 1
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "🔭  Meta API Watch — Pipeline Runner" -ForegroundColor Cyan
Write-Host "    Date:    $Date"
Write-Host "    Sources: $($sources.Count) enabled"
if ($DryRun) { Write-Host "    Mode:    DRY RUN (no files written)" -ForegroundColor Yellow }
Separator

$articlesToPublish = @()

foreach ($source in $sources) {
    $slug    = $source.slug
    $url     = $source.url
    $name    = $source.name
    $snapDir = Join-Path $SnapshotsDir $slug
    $snapFile = Join-Path $snapDir "$Date.md"

    Write-Host "📌 Source: $name" -ForegroundColor White
    Write-Host "   Slug:   $slug"
    Write-Host "   URL:    $url"
    Write-Host ""

    # ── STEP 1: Fetch & Snapshot ─────────────────────────────────────────────
    if (-not $SkipFetch -and -not (Test-Path $snapFile)) {
        Log "[$slug] Step 1: Fetch & Snapshot"
        Write-Host "🌐 STEP 1 — Fetch & Snapshot" -ForegroundColor Yellow

        $fetchPrompt = @"
You are the Fetch & Snapshot Agent for Meta API Watch.

Task:
1. Open this URL using the browser tool (real browser rendering — NOT a plain HTTP request):
   $url

2. Wait for the page to fully render (including any client-side JavaScript).

3. Extract the MAIN CONTENT ONLY:
   - Include: changelog entries, version headings, feature descriptions, dates, API changes
   - Exclude: navigation menus, sidebars, footers, cookie banners, login prompts, ads
   - Preserve heading hierarchy (use ## for h2, ### for h3, etc.)
   - Preserve dates and version numbers EXACTLY as shown on the page

4. Convert the extracted content to clean Markdown.

5. At the TOP, add this frontmatter:
---
source_slug: $slug
source_url: $url
fetched_at: $(Get-Date -Format "o")
snapshot_date: $Date
---

6. Save the full Markdown content to this EXACT file path:
   $snapFile

7. If the page fails to load:
   - Retry ONCE after 10 seconds
   - If it fails again, output: FETCH_FAILED: <reason>
   - Do NOT save a file in that case

Report back: "SNAPSHOT_SAVED: $snapFile" on success, or "FETCH_FAILED: <reason>" on failure.
"@

        Write-Host ""
        Write-Host "── ANTIGRAVITY PROMPT (copy & run this) ─────────────────────────────" -ForegroundColor DarkGray
        Write-Host $fetchPrompt -ForegroundColor Gray
        Write-Host "─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "⏸  Waiting for snapshot file: $snapFile"
        Write-Host "   Press ENTER when the snapshot has been saved (or type 'skip' to skip this source)..."
        if (-not $DryRun) {
            $input = Read-Host
            if ($input -eq 'skip') {
                Log "[$slug] Step 1: SKIPPED by user" "WARN"
                Separator; continue
            }
        }
    } elseif (Test-Path $snapFile) {
        Log "[$slug] Step 1: Snapshot already exists for $Date — skipping fetch"
        Write-Host "✅ Step 1: Snapshot exists for today" -ForegroundColor Green
    }

    # Verify snapshot exists before continuing
    if (-not (Test-Path $snapFile) -and -not $DryRun) {
        Log "[$slug] No snapshot found, skipping remaining steps" "WARN"
        Write-Host "⚠️  No snapshot found at $snapFile — skipping this source." -ForegroundColor Yellow
        Separator; continue
    }

    # ── STEP 2: Diff & Change Detection ─────────────────────────────────────
    Log "[$slug] Step 2: Diff & Change Detection"
    Write-Host "🔍 STEP 2 — Diff & Change Detection" -ForegroundColor Yellow

    $diffOutput = ""
    $diffStatus = ""

    if (-not $DryRun) {
        $diffResult = node "$ScriptDir\diff-snapshots.js" $slug 2>&1
        $exitCode   = $LASTEXITCODE

        $diffOutput = $diffResult | Out-String
        Write-Host $diffOutput

        if ($exitCode -eq 3) {
            $diffStatus = "BASELINE_ONLY"
            Log "[$slug] Step 2: BASELINE_ONLY — first run, no article needed"
            Write-Host "📋 First run — baseline established. No article needed." -ForegroundColor Blue
            Separator; continue
        }

        if ($exitCode -eq 2) {
            $diffStatus = "NO_CHANGE"
            Log "[$slug] Step 2: NO_CHANGE — nothing to publish"
            Write-Host "✅ No changes detected — nothing to publish." -ForegroundColor Green
            Separator; continue
        }

        $diffStatus = "CHANGES_FOUND"
        Log "[$slug] Step 2: CHANGES_FOUND — proceeding to draft"
        Write-Host "🆕 Changes detected — proceeding to draft!" -ForegroundColor Cyan
    }

    # ── STEP 3: Draft Article ─────────────────────────────────────────────────
    Log "[$slug] Step 3: Draft Article"
    Write-Host ""
    Write-Host "✍️  STEP 3 — Draft Article" -ForegroundColor Yellow
    Write-Host ""

    $draftFile = Join-Path $LogsDir "$Date-$slug-draft.md"

    $draftPrompt = @"
You are drafting a changelog article for an internal QA tool tracking Meta developer API
changes relevant to a WhatsApp/Instagram/Messenger CRM platform called SEEN V2.

Given this diff output from comparing today's snapshot to the previous one:

$diffOutput

Write an article using this EXACT frontmatter + body structure:

---
title: [short, specific title — e.g. "WhatsApp Marketing template pacing rules updated"]
date: $Date
source_slug: $slug
source_name: $name
source_url: $url
category: [ONE of: New Feature | Breaking Change | Deprecation | Policy/Compliance | Pricing/Rate Limit | Bug Fix/Clarification]
sv2_modules: [comma-separated list from: WhatsApp Templates, Broadcasts, Channel Integration/OAuth, Webhooks, Instagram Messaging, Messenger, Billing, RBAC — only tag what is ACTUALLY relevant]
summary_short: [1 sentence max — the headline of what changed]
audit_corrections: none
---

## Summary
[3-5 sentences, plain language, what actually changed]

## Why it Matters for SV2
[1-3 sentences — what could break, what to watch, which SEEN module is affected]

## Suggested QA Action
[Specific action — e.g. "Re-verify template pacing test cases in Broadcasts module" or "No action needed, informational only"]

## Source Details
- **Source**: [$name]($url)
- **Detected**: $Date
- **Compared against**: [previous snapshot date]

---
*Article drafted by Meta API Watch pipeline. Pending self-audit (Step 4).*

IMPORTANT rules:
- Do NOT invent details not present in the diff
- If something is ambiguous, say "Ambiguous — needs manual verification" explicitly
- Keep the title under 80 characters
- Only include sv2_modules that are directly affected

Save the completed article to: $draftFile
Then report: "DRAFT_SAVED: $draftFile"
"@

    Write-Host "── ANTIGRAVITY PROMPT (copy & run this) ─────────────────────────────" -ForegroundColor DarkGray
    Write-Host $draftPrompt -ForegroundColor Gray
    Write-Host "─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "⏸  Waiting for draft file: $draftFile"
    Write-Host "   Press ENTER when the draft has been saved..."
    if (-not $DryRun) { Read-Host | Out-Null }

    # ── STEP 3.5: Auto-generate LEARN section for New Features ───────────────
    Log "[$slug] Step 3.5: Check if New Feature → generate LEARN topic"
    Write-Host ""
    Write-Host "📚 STEP 3.5 — Auto-generate LEARN section (New Features only)" -ForegroundColor Cyan
    Write-Host ""

    $draftContentForLearn = if (Test-Path $draftFile) { Get-Content $draftFile -Raw } else { "" }
    $learnDir  = Join-Path $ProjectRoot "content-learn"
    $learnRootDir = Split-Path $ProjectRoot -Parent  # not used, using $learnDir directly

    $learnPrompt = @"
You are the LEARN Auto-generator for Meta API Watch.

Read the draft article below and decide:
  - IF the frontmatter field `category` is exactly "New Feature"
    → Create a NEW learn topic page (see instructions below)
  - IF the category is anything else (Breaking Change, Deprecation, etc.)
    → Output: "LEARN_SKIP: category is not New Feature — no learn topic needed."
    → Do NOT create any files.

═══════════════════════════════════════
DRAFT ARTICLE:
───────────────────────────────────────
$draftContentForLearn
═══════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF CATEGORY IS "New Feature" — INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Determine the PLATFORM from sv2_modules:
   - Contains "WhatsApp Templates", "Broadcasts", "Webhooks" → platform = "WhatsApp"
   - Contains "Instagram Messaging"                         → platform = "Instagram"
   - Contains "Messenger"                                   → platform = "Messenger"
   - Anything else / mixed                                  → platform = "Common"

2. Determine the LEARN DIRECTORY:
   - WhatsApp  → $learnDir\whatsapp\
   - Instagram → $learnDir\instagram\
   - Messenger → $learnDir\messenger\
   - Common    → $learnDir\common\

3. Create the learn topic file at:
   [learn-dir]\[feature-slug].md
   where [feature-slug] is a lowercase-hyphen-slug of the feature name (max 40 chars).

4. The file MUST use this EXACT frontmatter + body structure:

---
slug: [feature-slug]
title: [clear, descriptive title of the new feature]
platform: [WhatsApp | Instagram | Messenger | Common]
category: Core API
priority: high
new: true
new_since: $Date
changelog_article: $Date
source_url: $url
last_verified: $Date
---

# [Title]

[1-2 sentence intro: what this feature is and why it was added]

## Overview

[3-5 sentences explaining the feature clearly — what it does, when to use it, how it fits into the SEEN V2 workflow]

## How It Works

[Step-by-step explanation of the feature's mechanism. Use bullet points or numbered list.]

## Parameters & Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
[Fill in the actual fields from the feature — at minimum 3 rows]

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
[Fill in at least 3 real validation rules from the feature]

## Live Preview — What It Looks Like

[If the Meta documentation contains actual images/screenshots of this feature, EMBED them here using markdown: `![Feature UI Preview](https://scontent.../image.png)`]

[Provide detailed comparisons of correct vs wrong usages below:]

<!-- preview:accepted -->
### ✅ Correct Usage

```json
[Real working example from the actual Meta docs page — copy the exact example]
```

**Why it works:** [Brief explanation of why this is correct]

<!-- preview:rejected -->
### ❌ Common Mistake

```json
[Real rejected / wrong usage example]
```

**Error:** [The actual error code and message this produces]

## Comparison: Before vs After This Feature

| Aspect | Before This Feature | After This Feature |
|--------|--------------------|--------------------|
[At least 3 rows comparing old behavior vs new behavior]

## Code Example — Full Working Request

```json
[Complete, copy-paste-ready JSON example for SEEN V2 developers]
```

## SEEN V2 — Impact & Notes

| Module | Impact |
|--------|--------|
[List only the actually affected SEEN V2 modules and the specific impact]

> **📋 Linked Changelog Article:** This feature was detected on $Date.
> See: [Changelog entry for $Date]($url)

## QA Checklist

- [ ] Verify the new feature is accessible in your WABA / phone number
- [ ] Test the ✅ accepted example — confirm success response
- [ ] Test the ❌ rejected example — confirm expected error code
- [ ] [Add 2-3 more specific QA steps relevant to this feature]

5. IMPORTANT RULES:
   - DO NOT invent details. Use ONLY information from the draft article and the live source page.
   - For the "Live Preview" section: open the source URL ($url) with the browser tool and find the REAL example for this feature. Copy it exactly.
   - For the comparison table: base it on the diff showing what changed.
   - The "new: true" frontmatter flag is critical — it makes the card show a "NEW" badge in the Learn index.
   - Keep all JSON examples valid and copy-pasteable.

6. After saving the file, output:
   "LEARN_CREATED: [full path to the new .md file]"
   OR if skipped:
   "LEARN_SKIP: [reason]"
"@

    Write-Host "── ANTIGRAVITY PROMPT (copy & run this) ─────────────────────────────" -ForegroundColor DarkGray
    Write-Host $learnPrompt -ForegroundColor Gray
    Write-Host "─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "⏸  This step may create a new LEARN topic file."
    Write-Host "   Press ENTER when Step 3.5 is complete (or if skipped)..."
    if (-not $DryRun) { Read-Host | Out-Null }

    # ── STEP 4: Self-Audit ────────────────────────────────────────────────────
    Log "[$slug] Step 4: Self-Audit"
    Write-Host ""
    Write-Host "🔎 STEP 4 — Self-Audit (mandatory)" -ForegroundColor Yellow
    Write-Host ""

    $auditFile   = Join-Path $LogsDir "$Date-$slug-audited.md"
    $draftContent = if (Test-Path $draftFile) { Get-Content $draftFile -Raw } else { "[DRAFT FILE NOT FOUND]" }

    $auditPrompt = @"
You are the Self-Audit Agent for Meta API Watch. Your job is to verify every factual
claim in the draft article below against the LIVE source page.

THIS STEP IS MANDATORY. Do NOT skip it. Do NOT assume the draft is correct.

Steps:
1. Re-open this URL using the browser tool (real browser rendering):
   $url

2. Read the draft article below carefully.

3. For EVERY factual claim in the Summary, Why it Matters, and Suggested QA Action sections:
   - Find the corresponding text on the live page
   - Mark it as VERIFIED or INCORRECT

4. If INCORRECT: correct the claim to match what the page actually says, and note:
   "CORRECTED: [what was wrong] → [corrected to]"

5. Update the frontmatter field: audit_corrections: [summary of corrections, or "none"]

6. Output the final, verified article (with any corrections applied).

7. Save the verified article to: $auditFile

Draft to verify:
─────────────────
$draftContent
─────────────────

Report: "AUDIT_COMPLETE: $auditFile" with a brief note on any corrections made.
If no corrections were needed, say "AUDIT_COMPLETE: all claims verified against live source."
"@

    Write-Host "── ANTIGRAVITY PROMPT (copy & run this) ─────────────────────────────" -ForegroundColor DarkGray
    Write-Host $auditPrompt -ForegroundColor Gray
    Write-Host "─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "⏸  Waiting for audited file: $auditFile"
    Write-Host "   Press ENTER when the audit is complete..."
    if (-not $DryRun) { Read-Host | Out-Null }

    # ── STEP 5: Publish ────────────────────────────────────────────────────────
    Log "[$slug] Step 5: Publish & Rebuild Site"
    Write-Host ""
    Write-Host "📤 STEP 5 — Publish & Rebuild Site" -ForegroundColor Yellow

    if (-not $DryRun -and (Test-Path $auditFile)) {
        node "$ScriptDir\publish-article.js" $auditFile
        if ($LASTEXITCODE -eq 0) {
            Log "[$slug] Step 5: PUBLISHED successfully"
            Write-Host "✅ Article published and site rebuilt!" -ForegroundColor Green
        } else {
            Log "[$slug] Step 5: PUBLISH FAILED" "ERROR"
            Write-Host "❌ Publish failed — check logs." -ForegroundColor Red
        }
    } elseif ($DryRun) {
        Write-Host "   [DRY RUN] Would publish: $auditFile" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Audited file not found: $auditFile" -ForegroundColor Yellow
    }

    Separator
}

# ── Final summary ──────────────────────────────────────────────────────────────
Write-Host "✅ Pipeline run complete for date: $Date" -ForegroundColor Cyan
Write-Host "   Log: $RunLog"
Write-Host ""

<#
.SYNOPSIS
    Meta API Explain — Deploy to GitHub Pages
    Commits all changes and pushes to main → triggers GitHub Actions → live on Pages.

.DESCRIPTION
    Runs after the pipeline produces new articles. Commits snapshots, articles,
    and rebuilt site, then pushes to GitHub.

.PARAMETER Message
    Custom commit message. Default: auto-generated from new articles.

.PARAMETER DryRun
    Show what would be committed without actually committing or pushing.

.EXAMPLE
    .\scripts\deploy.ps1
    .\scripts\deploy.ps1 -Message "update: WhatsApp pricing July 2026"
    .\scripts\deploy.ps1 -DryRun
#>

param(
    [string]$Message = "",
    [switch]$DryRun
)

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ContentDir  = Join-Path $ProjectRoot "content\changelog"

# ── Check git status ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "🚀 Meta API Explain — Deploy" -ForegroundColor Cyan

$status = git -C $ProjectRoot status --short 2>&1
if (-not $status) {
    Write-Host "✅ Nothing to commit — everything is up to date." -ForegroundColor Green
    Write-Host "   GitHub Pages is already showing the latest content."
    exit 0
}

Write-Host ""
Write-Host "Changes to commit:" -ForegroundColor Yellow
Write-Host ($status | Out-String)

# ── Auto-generate commit message ──────────────────────────────────────────────
if (-not $Message) {
    # Find newly staged .md files in content/changelog/
    $newArticles = git -C $ProjectRoot diff --name-only --diff-filter=A HEAD 2>&1 |
        Where-Object { $_ -match "content/changelog/" }

    if ($newArticles) {
        $titles = $newArticles | ForEach-Object {
            $file = Join-Path $ProjectRoot ($_ -replace '/', '\')
            if (Test-Path $file) {
                $firstLine = Get-Content $file | Select-String "^title:" | Select-Object -First 1
                if ($firstLine) { $firstLine.Line -replace "^title:\s*", "" }
            }
        }
        $titleList = ($titles | Where-Object { $_ }) -join '; '
        $Message = if ($titleList) { "changelog: $titleList" } else { "changelog: new articles $(Get-Date -Format 'yyyy-MM-dd')" }
    } else {
        $Message = "snapshot: update $(Get-Date -Format 'yyyy-MM-dd')"
    }
}

Write-Host "Commit message: " -NoNewline
Write-Host $Message -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] Would run:" -ForegroundColor Yellow
    Write-Host "  git add -A"
    Write-Host "  git commit -m `"$Message`""
    Write-Host "  git push origin main"
    exit 0
}

# ── Stage + commit + push ─────────────────────────────────────────────────────
git -C $ProjectRoot add -A
if ($LASTEXITCODE -ne 0) { Write-Error "git add failed"; exit 1 }

git -C $ProjectRoot commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Error "git commit failed"; exit 1 }

git -C $ProjectRoot push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ git push failed." -ForegroundColor Red
    Write-Host "   Make sure you've set the remote origin first:"
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/meta-api-explain.git"
    Write-Host "   git remote add origin https://github.com/MahmoudMaher2/meta-api-explain.git"
    Write-Host "   Then run this script again."
    exit 1
}

Write-Host ""
Write-Host "✅ Deployed! GitHub Actions will now build and publish the site." -ForegroundColor Green
Write-Host "   Live at: https://mahmoudmaher2.github.io/meta-api-explain/"
Write-Host "   Actions: https://github.com/MahmoudMaher2/meta-api-explain/actions"
Write-Host ""

param(
    [string]$Message = '',
    [switch]$DryRun
)

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$status = git -C $ProjectRoot status --short 2>&1
if ($null -eq $status -or $status -eq '') {
    Write-Host '✅ Nothing to commit — everything is up to date.' -ForegroundColor Green
    exit 0
}

Write-Host 'Changes to commit:' -ForegroundColor Yellow
Write-Host ($status | Out-String)

# Auto-generate commit message if not provided
if (-not $Message) {
    # Find newly staged .md files in content/changelog/
    $newArticles = git -C $ProjectRoot diff --name-only --diff-filter=A HEAD 2>&1 |
        Where-Object { $_ -match 'content/changelog/' }

    if ($newArticles) {
        $titles = $newArticles | ForEach-Object {
            $file = Join-Path $ProjectRoot ($_ -replace '/', '\')
            if (Test-Path $file) {
                $firstLine = Get-Content $file | Select-String '^title:' | Select-Object -First 1
                if ($firstLine) { $firstLine.Line -replace '^title:\\s*', '' }
            }
        }
        $titleList = ($titles | Where-Object { $_ }) -join '; '
        $Message = if ($titleList) { 'changelog: ' + $titleList } else { 'changelog: new articles ' + (Get-Date -Format 'yyyy-MM-dd') }
    } else {
        $Message = 'snapshot: update ' + (Get-Date -Format 'yyyy-MM-dd')
    }
}

Write-Host 'Commit message: ' -NoNewline
Write-Host $Message -ForegroundColor Green
Write-Host ''

if ($DryRun) {
    Write-Host '[DRY RUN] Would run git add, commit, and push.'
    exit 0
}

git -C $ProjectRoot add -A
if ($LASTEXITCODE -ne 0) { Write-Error 'git add failed'; exit 1 }

git -C $ProjectRoot commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Error 'git commit failed'; exit 1 }

Write-Host 'Pushing to origin...' -ForegroundColor Cyan
git -C $ProjectRoot push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Pushing to origin master failed, trying origin main...' -ForegroundColor Yellow
    git -C $ProjectRoot push origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host '✅ Deployed successfully!' -ForegroundColor Green
} else {
    Write-Error 'git push failed'
    exit 1
}

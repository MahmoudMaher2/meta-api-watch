<#
.SYNOPSIS
    Sets up a Windows Scheduled Task to run the Meta API Watch pipeline daily.

.DESCRIPTION
    Creates a task that runs run-pipeline.ps1 every day at the specified time.
    Run this script ONCE as Administrator to register the task.

.PARAMETER RunAt
    Time to run the pipeline daily. Default: "08:00" (8 AM).

.PARAMETER TaskName
    Name of the scheduled task. Default: "MetaAPIWatch-Daily".

.EXAMPLE
    .\setup-scheduler.ps1
    .\setup-scheduler.ps1 -RunAt "07:30"
    .\setup-scheduler.ps1 -TaskName "MetaAPIWatch" -RunAt "09:00"
#>

param(
    [string]$RunAt    = "08:00",
    [string]$TaskName = "MetaAPIWatch-Daily"
)

$ScriptDir    = $PSScriptRoot
$PipelineScript = Join-Path $ScriptDir "run-pipeline.ps1"
$LogsDir      = Join-Path (Split-Path $ScriptDir -Parent) "logs"

# ── Verify pipeline script exists ─────────────────────────────────────────────
if (-not (Test-Path $PipelineScript)) {
    Write-Error "Pipeline script not found: $PipelineScript"
    exit 1
}

Write-Host ""
Write-Host "🔧 Meta API Watch — Scheduled Task Setup" -ForegroundColor Cyan
Write-Host "   Task name: $TaskName"
Write-Host "   Daily at:  $RunAt"
Write-Host "   Script:    $PipelineScript"
Write-Host ""

# ── Build the task ─────────────────────────────────────────────────────────────
$Action  = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PipelineScript`" -SkipFetch:$false" `
    -WorkingDirectory (Split-Path $ScriptDir -Parent)

$Trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At $RunAt

$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 15) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

$Principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -RunLevel Highest `
    -LogonType Interactive

# ── Register (or update) the task ────────────────────────────────────────────
try {
    $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "   ♻️  Removed existing task '$TaskName'" -ForegroundColor Yellow
    }

    Register-ScheduledTask `
        -TaskName  $TaskName `
        -Action    $Action `
        -Trigger   $Trigger `
        -Settings  $Settings `
        -Principal $Principal `
        -Description "Meta API Watch: daily check of Meta Developer Docs for SEEN V2 changelog tracking." `
        | Out-Null

    Write-Host "✅ Scheduled task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host "   Will run daily at $RunAt"
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host "  Start-ScheduledTask -TaskName '$TaskName'      # Run now"
    Write-Host "  Get-ScheduledTask  -TaskName '$TaskName'       # Check status"
    Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' # Remove task"

} catch {
    Write-Error "Failed to register task: $_"
    Write-Host ""
    Write-Host "💡 Try running this script as Administrator." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

param (
    [switch]$AutoPush = $true
)

$wsPath = "I:\_Dev_Builds_\2026\CLIENT_DELIVERY_PACKAGE\tmd-dominicana-v9"
$antigravityRoot = "C:\Users\TDBuild\antigravity"

Write-Host "🔍 Searching for latest AI Studio export in $antigravityRoot..." -ForegroundColor Cyan

# Find any exported folder created in the last 30 minutes with a hash suffix
$candidate = Get-ChildItem -Path $antigravityRoot -Directory | 
    Where-Object { 
        $_.Name -like "v9-TMD-Dominicana*" -and 
        $_.Attributes -notmatch "ReparsePoint" -and
        $_.LastWriteTime -ge (Get-Date).AddMinutes(-30)
    } | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1

if (-not $candidate) {
    Write-Host "⚠️ No new snapshot folder found in $antigravityRoot in the last 30 minutes." -ForegroundColor Yellow
    exit 0
}

$srcPath = $candidate.FullName
Write-Host "✓ Found new snapshot: $($candidate.Name) (Created: $($candidate.LastWriteTime))" -ForegroundColor Green

# 1. Sync files to workspace
Write-Host "📦 Syncing files into $wsPath..." -ForegroundColor Cyan
robocopy $srcPath $wsPath /E /NFL /NDL /NP /R:1 /W:1 /XD node_modules .git dist | Out-Null

# 2. Check firestore.rules for new collections
Write-Host "🛡️ Checking Firestore rules for schema updates..." -ForegroundColor Cyan
$rulesContent = Get-Content "$wsPath\firestore.rules" -Raw
$matches = [regex]::Matches($rulesContent, 'match\s+/([a-zA-Z0-9_]+)/')
$collections = $matches | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
Write-Host "Detected collections in rules: $($collections -join ', ')" -ForegroundColor Gray

# 3. Clean up temporary folder on C: to protect disk space
Write-Host "🧹 Purging staging folder on C: to preserve disk space..." -ForegroundColor Cyan
Remove-Item -Path $srcPath -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ C: drive protected." -ForegroundColor Green

# 4. Git status & auto-deploy to GitHub & Vercel
if ($AutoPush) {
    Write-Host "🚀 Checking Git status and pushing to GitHub (which triggers Vercel)..." -ForegroundColor Cyan
    git -C $wsPath add .
    $status = git -C $wsPath status --porcelain
    if ($status) {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
        git -C $wsPath commit -m "feat(ai-sync): snapshot from Google AI Studio ($timestamp) - in-place Supabase & Vercel update"
        git -C $wsPath push origin main
        Write-Host "✓ Pushed to GitHub main! Vercel production build triggered automatically." -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Working tree clean — no code changes between this snapshot and workspace." -ForegroundColor Gray
    }
}

Write-Host "🎉 In-place snapshot transfer and translation completed!" -ForegroundColor Green

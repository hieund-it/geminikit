# Setup Gemini Kit Memory Sync
# Run this once on each new machine to link local memory to your Cloud Drive.

$CloudPath = "C:\Users\$env:USERNAME\OneDrive\GeminiMemory\$($pwd.Name)" # Change 'OneDrive' to your sync folder
$LocalPath = Join-Path (Get-Location) ".gemini\memory"

# 1. Create Cloud Directory if not exists
if (!(Test-Path $CloudPath)) {
    New-Item -ItemType Directory -Path $CloudPath -Force
    Write-Host "Created Cloud Storage at: $CloudPath" -ForegroundColor Green
}

# 2. Backup existing local memory to Cloud (if any)
if (Test-Path $LocalPath) {
    Copy-Item -Path "$LocalPath\*" -Destination $CloudPath -Recurse -Force
    Remove-Item -Path $LocalPath -Recurse -Force
    Write-Host "Migrated existing memory to Cloud." -ForegroundColor Yellow
}

# 3. Create Junction (Symlink)
New-Item -ItemType Junction -Path $LocalPath -Value $CloudPath
Write-Host "Success! Local memory is now synced via Cloud Drive." -ForegroundColor Green
Write-Host "Git will still ignore these files, but Gemini CLI will see them." -ForegroundColor White

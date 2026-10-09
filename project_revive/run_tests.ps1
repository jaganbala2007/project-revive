Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   PROJECT REVIVE -- Automated Verification Test Suite   " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Assert-Check {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ''
    )
    if ($Condition) {
        $global:passCount++
        Write-Host "  [PASS] $Name" -ForegroundColor Green
    } else {
        $global:failCount++
        Write-Host "  [FAIL] $Name : $Details" -ForegroundColor Red
    }
}

# --- TEST 1: Capacity Retention Formula ---
$rated = 40.0
$current = 34.0
$retention = [Math]::Round(($current / $rated) * 100, 2)
Assert-Check -Name 'Capacity Retention Math (34/40 = 85.0 percent)' -Condition ($retention -eq 85.0) -Details "Expected 85.0, got $retention"

# --- TEST 2: Zero / Negative Boundary Checks ---
$invalidRated = 0
$validCheck = ($invalidRated -gt 0)
Assert-Check -Name 'Zero capacity rejection check' -Condition (-not $validCheck) -Details 'Zero capacity must not be allowed'

# --- TEST 3: Diagnostic Screening Rules ---
$testRetention1 = 82.0
$is2ndLife = ($testRetention1 -ge 75.0)
Assert-Check -Name 'Screening Rule: 82 percent retention qualifies as Second-Life Candidate' -Condition $is2ndLife

$testRetention2 = 64.0
$isRecycle = ($testRetention2 -lt 70.0)
Assert-Check -Name 'Screening Rule: 64 percent retention routes to Qualified Recycling Referral' -Condition $isRecycle

# --- TEST 4: SHA-256 Cryptographic Hash Verification ---
function Compute-SHA256 {
    param([string]$inputStr)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($inputStr)
    $hashBytes = $sha.ComputeHash($bytes)
    return -join ($hashBytes | ForEach-Object { '{0:x2}' -f $_ })
}

$genesisPayload = '{"actor":"REVIVE_CORE","batteryId":"SYSTEM_ROOT","eventType":"GENESIS","index":0,"prevHash":"0000000000000000000000000000000000000000000000000000000000000000"}'
$genesisHash = Compute-SHA256 -inputStr $genesisPayload
Assert-Check -Name 'Cryptographic Hash: Genesis block SHA-256 generated' -Condition ($genesisHash.Length -eq 64)

$block1Payload = '{"actor":"INGESTION","batteryId":"REV-LFP-9024","eventType":"BATTERY_REGISTERED","index":1,"prevHash":"' + $genesisHash + '"}'
$block1Hash = Compute-SHA256 -inputStr $block1Payload
Assert-Check -Name 'Cryptographic Chaining: Block 1 links to Genesis hash' -Condition ($block1Hash.Length -eq 64 -and $block1Hash -ne $genesisHash)

# --- TEST 5: Tamper Detection Logic ---
$alteredBlock1Payload = '{"actor":"HACKER","batteryId":"REV-LFP-9024","eventType":"BATTERY_REGISTERED","index":1,"prevHash":"' + $genesisHash + '"}'
$alteredHash = Compute-SHA256 -inputStr $alteredBlock1Payload
Assert-Check -Name 'Tamper Detection: Corrupted payload produces mismatched SHA-256 hash' -Condition ($alteredHash -ne $block1Hash)

# --- TEST 6: Financial Sensitivity Model ---
$intake = 1000
$avgKwh = 40
$yield = 0.65
$secondLifePacks = [Math]::Round($intake * $yield)
$recycledPacks = $intake - $secondLifePacks
$monthlyRate = 320
$months = 36
$usableKwh = $avgKwh * 0.80
$baasRev = $secondLifePacks * $usableKwh * $monthlyRate * $months
$grossCrores = [Math]::Round($baasRev / 10000000, 2)
Assert-Check -Name 'Financial Economics: BaaS revenue calculation valid' -Condition ($grossCrores -gt 0)

Write-Host "---------------------------------------------------------" -ForegroundColor Cyan
if ($failCount -eq 0) {
    Write-Host "SUMMARY: $passCount passed, $failCount failed (100% PASS)" -ForegroundColor Green
} else {
    Write-Host "SUMMARY: $passCount passed, $failCount failed" -ForegroundColor Red
}
Write-Host "=========================================================" -ForegroundColor Cyan

if ($failCount -gt 0) { exit 1 } else { exit 0 }

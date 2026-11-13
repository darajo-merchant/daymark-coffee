$ErrorActionPreference = 'Continue'
$projectRoot = Split-Path -Parent $PSScriptRoot
$port = 3010
$localUrl = 'http://localhost:{0}' -f $port

Set-Location -LiteralPath $projectRoot

function Get-PreviewLanAddresses {
  try {
    $addresses = Get-NetIPConfiguration |
      Where-Object { $_.NetAdapter.Status -eq 'Up' -and $_.IPv4DefaultGateway } |
      ForEach-Object { $_.IPv4Address.IPAddress } |
      Where-Object { $_ -and $_ -notlike '127.*' -and $_ -notlike '169.254.*' } |
      Select-Object -Unique
    return @($addresses)
  } catch {
    return @()
  }
}

function Show-PreviewAddresses {
  Write-Host ''
  Write-Host ('PC:    {0}' -f $localUrl) -ForegroundColor Cyan
  $lanAddresses = @(Get-PreviewLanAddresses)
  if ($lanAddresses.Count -gt 0) {
    foreach ($address in $lanAddresses) {
      $phoneUrl = 'http://{0}:{1}' -f $address, $port
      Write-Host ('Phone: {0}  (same Wi-Fi as this PC)' -f $phoneUrl) -ForegroundColor Cyan
    }
  } else {
    Write-Host 'Phone: Could not detect the PC Wi-Fi address. Run ipconfig and use its Wi-Fi IPv4 Address.' -ForegroundColor Yellow
  }

  try {
    $profiles = Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -ne 'Disconnected' }
    foreach ($networkProfile in $profiles) {
      Write-Host ('Network: {0} - {1}' -f $networkProfile.Name, $networkProfile.NetworkCategory)
      if ($networkProfile.NetworkCategory -eq 'Public') {
        Write-Host 'The existing firewall rule allows the Private profile only. The phone may be blocked while Wi-Fi is Public.' -ForegroundColor Yellow
      }
    }
  } catch {
    Write-Host 'Could not read the Windows network profile.' -ForegroundColor DarkGray
  }
  Write-Host ''
}

$responding = $false
try {
  $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 4 -UseBasicParsing
  $responding = $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
} catch {
  $responding = $false
}

if ($responding) {
  Write-Host ('Daymark is already responding on port {0}. I will leave its server running.' -f $port) -ForegroundColor Green
  Show-PreviewAddresses
  Start-Process $localUrl
  Read-Host 'Press Enter to close this helper (the site server stays running)'
  exit 0
}

$listeners = @()
try {
  $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
} catch {}

if ($listeners.Count -eq 0) {
  try {
    $netstatLines = @(netstat -ano -p tcp | Select-String (':{0}\s+.*LISTENING' -f $port))
    foreach ($line in $netstatLines) {
      $parts = ($line.Line -split '\s+') | Where-Object { $_ }
      if ($parts.Count -ge 5) {
        $listeners += [pscustomobject]@{ OwningProcess = [int]$parts[-1] }
      }
    }
  } catch {}
}

if ($listeners.Count -gt 0) {
  $pids = ($listeners | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
  Write-Host ('Port {0} has a listener (process ID {1}), but the site did not answer on localhost.' -f $port, $pids) -ForegroundColor Red
  Write-Host 'I did not stop or replace it. This usually means the existing server is stuck or belongs to another app.'
  Write-Host 'Please send this screen to the developer so the listener can be identified safely.'
  Read-Host 'Press Enter to close this helper'
  exit 1
}

Write-Host ('Port {0} is free. Starting Daymark from its project folder on all network interfaces...' -f $port) -ForegroundColor Green
Show-PreviewAddresses
Write-Host 'Keep this window open while using the preview. Press Ctrl+C only when you are done.' -ForegroundColor Yellow
Write-Host ''
npm run dev -- --hostname 0.0.0.0 --port $port


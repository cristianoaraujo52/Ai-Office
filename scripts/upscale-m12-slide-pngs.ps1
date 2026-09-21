$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Join-Path (Get-Location) "public\slides\m12"
$backup = Join-Path (Get-Location) ".logs\m12-originals-1672x941-20260616"
$targetWidth = 3840
$targetHeight = 2160

New-Item -ItemType Directory -Force -Path $backup | Out-Null

$slideNames = foreach ($lesson in 1..3) {
  foreach ($index in 1..5) {
    "aula-12-$lesson-$($index.ToString('00')).png"
  }
}

function Resize-CoverPng {
  param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$DestinationPath
  )

  $source = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $scale = [Math]::Max($targetWidth / $source.Width, $targetHeight / $source.Height)
    $resizedWidth = [Math]::Ceiling($source.Width * $scale)
    $resizedHeight = [Math]::Ceiling($source.Height * $scale)

    $canvas = [System.Drawing.Bitmap]::new($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $x = [Math]::Floor(($targetWidth - $resizedWidth) / 2)
      $y = [Math]::Floor(($targetHeight - $resizedHeight) / 2)
      $graphics.DrawImage($source, $x, $y, $resizedWidth, $resizedHeight)

      $canvas.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $graphics.Dispose()
      $canvas.Dispose()
    }

    return [PSCustomObject]@{
      Width = $source.Width
      Height = $source.Height
    }
  }
  finally {
    $source.Dispose()
  }
}

Write-Output "backup: $backup"

foreach ($name in $slideNames) {
  $sourcePath = Join-Path $root $name
  $backupPath = Join-Path $backup $name

  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Missing slide: $sourcePath"
  }

  Copy-Item -LiteralPath $sourcePath -Destination $backupPath -Force
  $original = Resize-CoverPng -SourcePath $backupPath -DestinationPath $sourcePath

  Write-Output "$name`: $($original.Width)x$($original.Height) -> ${targetWidth}x${targetHeight}"
}

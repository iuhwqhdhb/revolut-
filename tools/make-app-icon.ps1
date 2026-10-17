param(
  [string]$Output = (Join-Path $PSScriptRoot "..\ios\RevolutDemo\Assets.xcassets\AppIcon.appiconset\AppIcon.png"),
  [int]$Size = 1024
)

Add-Type -AssemblyName System.Drawing

$scale = $Size / 800.0

function S([double]$value) { return [single]($value * $script:scale) }
function Pt([double]$x, [double]$y) { return (New-Object System.Drawing.PointF((S $x), (S $y))) }

$bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
$bitmap.SetResolution(72, 72)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::White)

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddRectangle((New-Object System.Drawing.RectangleF((S 209.051), (S 262.097), (S 101.445), (S 410.21))))

$path.StartFigure()
$path.AddBezier((Pt 628.623 285.554), (Pt 628.623 198.511), (Pt 557.741 127.694), (Pt 470.612 127.694))
$path.AddLine((Pt 470.612 127.694), (Pt 209.051 127.694))
$path.AddLine((Pt 209.051 127.694), (Pt 209.051 215.297))
$path.AddLine((Pt 209.051 215.297), (Pt 458.176 215.297))
$path.AddBezier((Pt 458.176 215.297), (Pt 497.606 215.297), (Pt 530.269 246.275), (Pt 530.990 284.348))
$path.AddBezier((Pt 530.990 284.348), (Pt 531.351 303.412), (Pt 524.196 321.404), (Pt 510.844 335.008))
$path.AddBezier((Pt 510.844 335.008), (Pt 497.487 348.618), (Pt 479.640 356.117), (Pt 460.593 356.117))
$path.AddLine((Pt 460.593 356.117), (Pt 363.547 356.117))
$path.AddBezier((Pt 363.547 356.117), (Pt 360.101 356.117), (Pt 357.297 358.917), (Pt 357.297 362.362))
$path.AddLine((Pt 357.297 362.362), (Pt 357.297 440.221))
$path.AddBezier((Pt 357.297 440.221), (Pt 357.297 441.545), (Pt 357.706 442.811), (Pt 358.476 443.877))
$path.AddLine((Pt 358.476 443.877), (Pt 523.131 672.307))
$path.AddLine((Pt 523.131 672.307), (Pt 643.661 672.307))
$path.AddLine((Pt 643.661 672.307), (Pt 478.623 443.253))
$path.AddBezier((Pt 478.623 443.253), (Pt 561.736 439.080), (Pt 628.623 369.248), (Pt 628.623 285.554))
$path.CloseFigure()

$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 8, 8, 11))
$graphics.FillPath($brush, $path)

$graphics.Dispose()
$brush.Dispose()
$path.Dispose()

$directory = Split-Path -Parent $Output
New-Item -ItemType Directory -Force -Path $directory | Out-Null
$bitmap.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Output $Output

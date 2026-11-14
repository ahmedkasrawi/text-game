# Script to extract downloaded SDK components and build APK
$ErrorActionPreference = "Stop"

$sdkDir = "$env:LOCALAPPDATA\Android\Sdk"
$btZip = "$env:TEMP\build-tools_r36.zip"
$pltZip = "$env:TEMP\platform-36.zip"

Write-Host "1. فك ضغط Build-Tools 36..." -ForegroundColor Cyan
$btDest = "$sdkDir\build-tools\36.0.0"
if (Test-Path $btDest) { Remove-Item -Path $btDest -Recurse -Force }
New-Item -ItemType Directory -Path "$env:TEMP\bt_temp" -Force | Out-Null
Expand-Archive -Path $btZip -DestinationPath "$env:TEMP\bt_temp" -Force
$innerBt = Get-ChildItem -Path "$env:TEMP\bt_temp" -Directory | Select-Object -First 1
Move-Item -Path $innerBt.FullName -Destination $btDest -Force
Remove-Item -Path "$env:TEMP\bt_temp" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "2. فك ضغط Platform 36 (android.jar)..." -ForegroundColor Cyan
$pltDest = "$sdkDir\platforms\android-36"
if (Test-Path $pltDest) { Remove-Item -Path $pltDest -Recurse -Force }
New-Item -ItemType Directory -Path "$env:TEMP\plt_temp" -Force | Out-Null
Expand-Archive -Path $pltZip -DestinationPath "$env:TEMP\plt_temp" -Force
$innerPlt = Get-ChildItem -Path "$env:TEMP\plt_temp" -Directory | Select-Object -First 1
Move-Item -Path $innerPlt.FullName -Destination $pltDest -Force
Remove-Item -Path "$env:TEMP\plt_temp" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "3. التحقق من جاهزية ملفات أندرويد SDK..." -ForegroundColor Green
$aapt2 = Test-Path "$btDest\aapt2.exe"
$androidJar = Test-Path "$pltDest\android.jar"
Write-Host "   aapt2.exe: $aapt2"
Write-Host "   android.jar: $androidJar"

if (-not $aapt2 -or -not $androidJar) {
    throw "فشل التحقق من ملفات الـ SDK المطلوبة."
}

Write-Host "`n4. بدء تجميع الـ APK عبر Gradle..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Users\pp''\jdk17\PFiles64\Microsoft\jdk-17.0.21.21-hotspot"
$env:ANDROID_HOME = $sdkDir
Set-Location android

.\gradlew.bat assembleDebug --no-daemon

$sourceApk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $sourceApk) {
    Set-Location ..
    Copy-Item -Path "android\$sourceApk" -Destination "الظل_التاه_v6.apk" -Force
    Copy-Item -Path "android\$sourceApk" -Destination "app-debug.apk" -Force
    Write-Host "`n================================================" -ForegroundColor Green
    Write-Host "✓ نجح تجميع التطبيق وإنشاء ملف الـ APK بنجاح!" -ForegroundColor Green
    Write-Host "📁 مسار الملف: $(Get-Item 'الظل_التاه_v6.apk').FullName" -ForegroundColor Green
    Write-Host "حجم الملف: $([math]::Round((Get-Item 'الظل_التاه_v6.apk').Length / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
} else {
    throw "لم يتم العثور على ملف app-debug.apk الناتج."
}

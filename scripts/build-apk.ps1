# Build APK Script for "الظل التاه"
$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 بدء بناء تطبيق أندرويد للعبة «الظل التاه»" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check JAVA_HOME
$javaHome = $env:JAVA_HOME
if (-not $javaHome -or -not (Test-Path "$javaHome\bin\java.exe")) {
    $fallbackJava = "$env:USERPROFILE\jdk17\PFiles64\Microsoft\jdk-17.0.21.21-hotspot"
    if (Test-Path "$fallbackJava\bin\java.exe") {
        $env:JAVA_HOME = $fallbackJava
        Write-Host "✓ تم ضبط JAVA_HOME إلى: $fallbackJava" -ForegroundColor Green
    } else {
        Write-Host "⚠ لم يتم العثور على Java JDK 17. يرجى تثبيت Java أو استخدام Android Studio." -ForegroundColor Yellow
    }
}

# 1. Sync Web Assets to Android
Write-Host "`n1. مزامنة وتحديث ملفات الويب..." -ForegroundColor Yellow
npm run cap:sync

# 2. Build via Gradle
Write-Host "`n2. بدء تجميع الـ APK عبر Gradle..." -ForegroundColor Yellow
Set-Location android

try {
    .\gradlew.bat assembleDebug
    
    $sourceApk = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $sourceApk) {
        Set-Location ..
        $outputApk = "الظل_التاه_v6.apk"
        Copy-Item -Path "android\$sourceApk" -Destination $outputApk -Force
        
        Write-Host "`n================================================" -ForegroundColor Green
        Write-Host "✓ تم بناء ملف التطبيق بنجاح!" -ForegroundColor Green
        Write-Host "📁 مسار ملف التثبيت المباشر: $(Get-Item $outputApk).FullName" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
    }
} catch {
    Set-Location ..
    Write-Host "`n⚠ تنبيه بخصوص تجميع Gradle المباشر: $_" -ForegroundColor Yellow
    Write-Host "ℹ يمكنك فتح المشروع مباشرة وبناء الـ APK بضغطة زر واحدة عبر الأمر:" -ForegroundColor Cyan
    Write-Host "   npm run cap:open" -ForegroundColor White
}

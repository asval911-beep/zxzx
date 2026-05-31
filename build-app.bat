@echo off
CHCP 65001 > nul
title نظام بلدية الكويت 139 - معالج بناء وإصدار البرنامج

echo ====================================================
echo    نظام بلدية الكويت 139 - معالج بناء وإصدار البرنامج
echo ====================================================
echo.
echo سيقوم هذا الملف التلقائي (Pat) بتهيئة الصور، تنزيل الأدوات، وبناء البرنامج كاملا.
echo.

:: 1. Check for Node JS
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطأ] لم يتم العثور على Node.js مثبت على جهازك!
    echo يرجى تحميله وتثبيته أولا من https://nodejs.org ليعمل معالج البناء.
    pause
    exit /b 1
)

:: 2. Install dependencies
if not exist node_modules (
    echo [تلقائي] جاري تثبيت حزم البرمجة اللآزمة للعمل...
    call npm install
)

:: 3. Run the Javascript build-patch helper
echo.
echo [تلقائي] جاري تشغيل المصحح وتجهيز الشعارات وتحويل الأيقونات...
call node build-patch.js

echo.
echo ====================================================
echo عملية معالجة وحقن الأيقونات وبناء البرنامج انتهت!
echo ====================================================
pause

@echo off
chcp 65001 > nul
echo ===================================================
echo   Coach Sheikha Platform - Local Development Mode
echo   منصة كوتش شيخة - وضع التطوير المحلي بدون Docker
echo ===================================================
echo.
echo وضع التطوير المحلي مفعل (VITE_LOCAL_DEVELOPMENT=true).
echo يتم تشغيل الواجهة المحلية بدون الحاجة إلى Docker أو سوبابيز.
echo.
call npm run dev

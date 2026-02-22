@echo off
echo 🚀 Updating GitHub Repository...

REM Add all changes
git add .

REM Commit with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

git commit -m "Update: Enhanced login pages with credentials and deployment ready - %timestamp%"

REM Push to main branch
git push origin main

echo ✅ Repository updated successfully!
echo 📋 Changes include:
echo - Enhanced login pages with demo credentials
echo - Added deployment configuration files  
echo - Fixed missing dependencies and modules
echo - Added comprehensive documentation

pause
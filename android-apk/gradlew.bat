@rem
@rem Gradle startup script for Windows
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  The MoSaFa Tools Android APK Build script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

where gradle >nul 2>nul
if %ERRORLEVEL% equ 0 (
    gradle %*
) else (
    echo Gradle not found in PATH, invoking python packager...
    python ..\scripts\package-apk.py
)

:end
@rem End local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" endlocal

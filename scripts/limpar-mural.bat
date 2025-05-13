@echo off
setlocal enableextensions

echo Verificando diretórios a remover...

set RAIZ=smartvalidity-angular\src\app\components\mural

REM Verificar se os diretórios existem
if exist "%RAIZ%\dashboard" (
    echo Encontrado: %RAIZ%\dashboard
) else (
    echo Não encontrado: %RAIZ%\dashboard
)

if exist "%RAIZ%\shared\filtros-rapidos" (
    echo Encontrado: %RAIZ%\shared\filtros-rapidos
) else (
    echo Não encontrado: %RAIZ%\shared\filtros-rapidos
)

if exist "%RAIZ%\shared\filtros-tags" (
    echo Encontrado: %RAIZ%\shared\filtros-tags
) else (
    echo Não encontrado: %RAIZ%\shared\filtros-tags
)

if exist "%RAIZ%\modals\filtros-avancados" (
    echo Encontrado: %RAIZ%\modals\filtros-avancados
) else (
    echo Não encontrado: %RAIZ%\modals\filtros-avancados
)

if exist "%RAIZ%\modals\inspecao" (
    echo Encontrado: %RAIZ%\modals\inspecao
) else (
    echo Não encontrado: %RAIZ%\modals\inspecao
)

REM Confirmação para prosseguir
set /p CONFIRMACAO=Deseja prosseguir com a remoção? (S/N):
if /i "%CONFIRMACAO%" neq "S" (
    echo Operação cancelada pelo usuário.
    goto :EOF
)

echo.
echo Removendo diretórios...

REM Remover diretórios
if exist "%RAIZ%\dashboard" (
    rmdir /s /q "%RAIZ%\dashboard"
    echo Removido: %RAIZ%\dashboard
)

if exist "%RAIZ%\shared\filtros-rapidos" (
    rmdir /s /q "%RAIZ%\shared\filtros-rapidos"
    echo Removido: %RAIZ%\shared\filtros-rapidos
)

if exist "%RAIZ%\shared\filtros-tags" (
    rmdir /s /q "%RAIZ%\shared\filtros-tags"
    echo Removido: %RAIZ%\shared\filtros-tags
)

if exist "%RAIZ%\modals\filtros-avancados" (
    rmdir /s /q "%RAIZ%\modals\filtros-avancados"
    echo Removido: %RAIZ%\modals\filtros-avancados
)

if exist "%RAIZ%\modals\inspecao" (
    rmdir /s /q "%RAIZ%\modals\inspecao"
    echo Removido: %RAIZ%\modals\inspecao
)

echo.
echo Verificando diretórios vazios...

REM Tentar remover diretório shared se estiver vazio
if exist "%RAIZ%\shared" (
    dir /a /b "%RAIZ%\shared" > nul 2>&1
    if errorlevel 1 (
        rmdir "%RAIZ%\shared"
        echo Diretório vazio removido: %RAIZ%\shared
    ) else (
        echo Diretório não está vazio, mantido: %RAIZ%\shared
        echo Conteúdo:
        dir /b "%RAIZ%\shared"
    )
)

REM Tentar remover diretório modals se estiver vazio
if exist "%RAIZ%\modals" (
    dir /a /b "%RAIZ%\modals" > nul 2>&1
    if errorlevel 1 (
        rmdir "%RAIZ%\modals"
        echo Diretório vazio removido: %RAIZ%\modals
    ) else (
        echo Diretório não está vazio, mantido: %RAIZ%\modals
        echo Conteúdo:
        dir /b "%RAIZ%\modals"
    )
)

echo.
echo Operação concluída!
echo.

endlocal

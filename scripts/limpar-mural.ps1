# Script PowerShell para remover os diretórios que foram migrados
# Executar a partir do diretório raiz do projeto

$raiz = ".\smartvalidity-angular\src\app\components\mural"

# Lista de diretórios a remover
$diretoriosRemover = @(
    "$raiz\dashboard",
    "$raiz\shared\filtros-rapidos",
    "$raiz\shared\filtros-tags",
    "$raiz\modals\filtros-avancados",
    "$raiz\modals\inspecao"
)

# Verificar se os diretórios existem
Write-Host "Verificando diretórios a remover:" -ForegroundColor Yellow
foreach ($dir in $diretoriosRemover) {
    if (Test-Path $dir) {
        Write-Host "Encontrado: $dir" -ForegroundColor Green
    } else {
        Write-Host "Não encontrado: $dir" -ForegroundColor Red
    }
}

# Confirmação para prosseguir
$confirmacao = Read-Host -Prompt "Deseja prosseguir com a remoção? (S/N)"
if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Red
    Exit
}

# Remover diretórios
Write-Host "`nRemovendo diretórios:" -ForegroundColor Yellow
foreach ($dir in $diretoriosRemover) {
    if (Test-Path $dir) {
        try {
            Remove-Item -Path $dir -Recurse -Force
            Write-Host "Removido: $dir" -ForegroundColor Green
        } catch {
            Write-Host "Erro ao remover: $dir - $_" -ForegroundColor Red
        }
    }
}

# Tentar remover diretórios vazios
$diretoriosVazios = @(
    "$raiz\shared",
    "$raiz\modals"
)

Write-Host "`nVerificando diretórios vazios:" -ForegroundColor Yellow
foreach ($dir in $diretoriosVazios) {
    if (Test-Path $dir) {
        $conteudo = Get-ChildItem -Path $dir
        if ($conteudo.Count -eq 0) {
            try {
                Remove-Item -Path $dir -Force
                Write-Host "Diretório vazio removido: $dir" -ForegroundColor Green
            } catch {
                Write-Host "Erro ao remover diretório vazio: $dir - $_" -ForegroundColor Red
            }
        } else {
            Write-Host "Diretório não está vazio, mantido: $dir" -ForegroundColor Cyan
            Write-Host "Conteúdo:" -ForegroundColor Cyan
            foreach ($item in $conteudo) {
                Write-Host " - $($item.Name)" -ForegroundColor Cyan
            }
        }
    }
}

Write-Host "`nOperação concluída!" -ForegroundColor Green

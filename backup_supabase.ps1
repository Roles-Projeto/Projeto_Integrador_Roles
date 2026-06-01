[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$env:PGPASSWORD  = "Roles38225544"
$SUPABASE_URL    = "postgresql://postgres.vdbwazvaxgvsgpkzyoxo@aws-1-us-west-2.pooler.supabase.com:6543/postgres"
$PSQL            = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

Write-Host "Exportando MySQL..." -ForegroundColor Cyan
$sql = docker exec roles_mysql sh -c "mysqldump --default-character-set=utf8mb4 --no-tablespaces --skip-add-locks --skip-comments -u root -p265 roles_db" | Out-String

Write-Host "Convertendo para PostgreSQL..." -ForegroundColor Cyan

# Remove cabeçalhos MySQL
$sql = $sql -replace '(?m)^/\*!.*?\*/;?\s*$', ''
$sql = $sql -replace '(?m)^SET .*?;', ''
$sql = $sql -replace '(?m)^LOCK TABLES.*?;', ''
$sql = $sql -replace '(?m)^UNLOCK TABLES.*?;', ''
$sql = $sql -replace '(?m)^USE .*?;', ''

# Converte tipos MySQL → PostgreSQL
$sql = $sql -replace '`', '"'
$sql = $sql -replace ' int\([\d]+\)', ' INTEGER'
$sql = $sql -replace ' tinyint\([\d]+\)', ' SMALLINT'
$sql = $sql -replace ' bigint\([\d]+\)', ' BIGINT'
$sql = $sql -replace ' varchar\(', ' VARCHAR('
$sql = $sql -replace ' datetime', ' TIMESTAMP'
$sql = $sql -replace ' longtext', ' TEXT'
$sql = $sql -replace ' mediumtext', ' TEXT'
$sql = $sql -replace ' tinytext', ' TEXT'
$sql = $sql -replace ' double', ' NUMERIC'
$sql = $sql -replace ' float', ' NUMERIC'
$sql = $sql -replace 'AUTO_INCREMENT', 'GENERATED ALWAYS AS IDENTITY'
$sql = $sql -replace ' ENGINE=\w+', ''
$sql = $sql -replace ' DEFAULT CHARSET=\w+', ''
$sql = $sql -replace ' COLLATE=[\w]+', ''
$sql = $sql -replace ' COLLATE [\w]+', ''
$sql = $sql -replace ' unsigned', ''

# Remove índices MySQL incompatíveis
$sql = $sql -replace '(?m)^\s*(KEY|UNIQUE KEY|PRIMARY KEY\s+\w)[^,\n]*,?', ''

# Remove vírgulas antes de ) em CREATE TABLE
$sql = $sql -replace ',\s*\)', "`n)"

Write-Host "Subindo para o Supabase..." -ForegroundColor Cyan
$sql | & $PSQL $SUPABASE_URL

if ($LASTEXITCODE -eq 0) {
    Write-Host "Supabase atualizado com sucesso! ✅" -ForegroundColor Green
} else {
    Write-Host "Erro ao subir para o Supabase ❌" -ForegroundColor Red
}
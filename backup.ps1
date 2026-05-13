[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

docker exec roles_mysql sh -c "mysqldump --default-character-set=utf8mb4 -u root -p265 roles_db" |
Set-Content -Encoding utf8 backend/db-init/backup.sql

docker exec roles_mysql sh -c "mysqldump --default-character-set=utf8mb4 -u root -p265 roles_db" |
Set-Content -Encoding utf8 backend/db-init/reservas/backup_reserva.sql

Write-Host "Backup atualizado com UTF-8 ✅"
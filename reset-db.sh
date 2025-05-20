#!/bin/bash

DB_NAME="online-library"
SQL_FILE="/mnt/c/Users/Acer Nitro5/CLionProjects/online-library/frontend/database/data.sql"

echo "🔁 Перезапускаем PostgreSQL..."
sudo service postgresql restart

echo "🔨 Завершаем активные сессии..."
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

echo "🧨 Удаляем базу '$DB_NAME' (если существует)..."
sudo -u postgres dropdb --if-exists "${DB_NAME}"

echo "🆕 Создаём базу заново..."
sudo -u postgres createdb "${DB_NAME}"

echo "📥 Загружаем данные из файла: $SQL_FILE"
sudo -u postgres psql -d "${DB_NAME}" -f "${SQL_FILE}"

echo "✅ Готово! База '${DB_NAME}' обновлена."


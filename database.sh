#!/bin/bash
set -e

# Переход под пользователем postgres
sudo -i -u postgres bash <<EOF

# Удаление базы (если есть)
psql -c "DROP DATABASE IF EXISTS \\"online-library\\";"

# Создание базы
psql -c "CREATE DATABASE \\"online-library\\";"

# Импорт таблиц и данных
psql -d "online-library" -f "/rontend/database/data.sql"

EOF

echo "✅ База данных online-library создана и заполнена."

#!/bin/bash

# Папки проекта
SERVER_DIR="./server"
FRONTEND_DIR="./frontend"

# Путь к исполняемому серверу
SERVER_BIN="$SERVER_DIR/server"

echo "🔄 Остановка предыдущего сервера (если был)..."
pkill -f "$SERVER_BIN" 2>/dev/null

echo "🛠 Компиляция C++ сервера..."
g++ "$SERVER_DIR/server.cpp" -o "$SERVER_BIN" -std=c++17 -lpqxx -lpq

if [ $? -ne 0 ]; then
    echo "❌ Ошибка компиляции. Сервер не запущен."
    exit 1
fi
echo "Завершаем фронтенд-сервер"
pkill -f http.server

echo "🚀 Запуск C++ REST API сервера на порту 8080..."
"$SERVER_BIN" &

echo "🌐 Запуск фронтенд-сервера на порту 8081..."
cd "$FRONTEND_DIR"
python3 -m http.server 8081 &

echo "✅ Всё запущено!
- API:      http://localhost:8080/books
- Сайт:     http://localhost:8081/index.html"

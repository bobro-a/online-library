#!/bin/bash

set -e
echo "http://localhost:8081/index.html"
# Запустить простой HTTP сервер на 8000 порту
# HTML-файлы должны лежать в этой же папке
cd frontend
python3 -m http.server 8081

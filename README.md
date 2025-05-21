# online-library
# Запуск (всё для Линукс)
Сначала устанавливаем postgres sql
```bash
sudo apt update
sudo apt upgrade
sudo apt install postgresql postgresql-contrib
```
Затем создаём таблицу через терминал:
```bash
sudo -u postgres psql -c "drop database if exists \"online-library\";"
sudo -u postgres psql -c "CREATE DATABASE \"online-library\"";
sudo -u postgres psql -d "online-library" -f frontend/database/data.sql #заполняем базу данных
```

Проверка всё ли норм:
```bash
sudo -u postgres psql -d "online-library"
\dt        #-- покажет список таблиц
SELECT * FROM books;
```

Запускаем скрипт server.sh и в отдельном терминале 
запускаем client.sh
Очистка кэша браузера - Ctrl + F5
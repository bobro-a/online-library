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
sudo -u postgres psql
CREATE DATABASE "online-library";
\q #выход из postgresql
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
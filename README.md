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
sudo -u postgres psql -d "online-library" -f /database/data.sql #заполняем базу данных
```

Проверка всё ли норм:
```bash
sudo -u postgres psql -d "online-library"
\dt        #-- покажет список таблиц
SELECT * FROM books;
```

# Сервер
Теперь нам нужно установить crow (api, который будет связывать бд с сервером и клиентов( сайтом))
Чтобы его установить нужен пакетный менеджер `vcpkg`
```bash
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh
./vcpkg install crow
```
```bash
./vcpkg install crow # устанавливаем crow
./vcpkg install libpqxx #устанавливаем библиотеку для работы c++ с базой данных postgresql
```
В Clion в директории File → Settings → Build, Execution, Deployment → CMake В поле "CMake options" вставить -`-DCMAKE_TOOLCHAIN_FILE=/mnt/d/project/online-library/vcpkg/scripts/buildsystems/vcpkg.cmake
`
#!/bin/bash
sudo -u postgres psql -c "drop database if exists \"online-library\";"
sudo -u postgres psql -c "CREATE DATABASE \"online-library\"";
sudo -u postgres psql -d "online-library" -f frontend/database/data.sql
echo "✅ База данных online-library создана и заполнена."

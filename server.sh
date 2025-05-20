#!/bin/bash

# 1. Сборка проекта
mkdir -p build
cd build
cmake ../server/
make

# 2. Запуск сервера
./server


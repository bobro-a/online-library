#!/bin/bash

# 1. Сборка проекта
rm -rf build
mkdir -p build
cd build
cmake ../server/
make

# 2. Запуск сервера
./server


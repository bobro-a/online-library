cmake_minimum_required(VERSION 3.10)
project(online-library)

set(CMAKE_CXX_STANDARD 17)

find_package(Crow CONFIG REQUIRED)
find_package(pqxx CONFIG REQUIRED)

add_executable(server server.cpp)
target_link_libraries(server PRIVATE Crow::Crow pqxx)
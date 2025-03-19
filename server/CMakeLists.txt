cmake_minimum_required(VERSION 3.10)
project(online-library)

set(CMAKE_CXX_STANDARD 17)

include_directories(${CMAKE_SOURCE_DIR}/../vcpkg/installed/x64-windows/include)
link_directories(${CMAKE_SOURCE_DIR}/../vcpkg/installed/x64-windows/lib)

add_executable(server server.cpp)
target_link_libraries(server PRIVATE pqxx pq)
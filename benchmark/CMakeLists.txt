cmake_minimum_required(VERSION 3.13)

project(benchmark)
add_library(${PROJECT_NAME} STATIC src/benchmark_main.cc)
target_include_directories(${PROJECT_NAME} PUBLIC ./include)

project(benchmark_main)
add_library(${PROJECT_NAME} STATIC src/benchmark_main.cc)
target_include_directories(${PROJECT_NAME} PUBLIC ./include)

target_link_libraries(benchmark_main benchmark)
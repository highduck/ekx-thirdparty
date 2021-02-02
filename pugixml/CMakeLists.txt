cmake_minimum_required(VERSION 3.13)
project(pugixml)

add_library(${PROJECT_NAME} STATIC
        src/pugixml.cpp
        src/pugixml.hpp
        src/pugiconfig.hpp
        )

target_include_directories(${PROJECT_NAME} PUBLIC ./src)

cmake_minimum_required(VERSION 3.13)
project(miniz)

add_library(${PROJECT_NAME} STATIC
        src/miniz.c
        src/miniz.h
        src/miniz_export.h
        src/miniz_tdef.c
        src/miniz_tdef.h
        src/miniz_tinfl.c
        src/miniz_tinfl.h
        src/miniz_zip.c
        src/miniz_zip.h
        )

target_include_directories(${PROJECT_NAME} PUBLIC ./src)

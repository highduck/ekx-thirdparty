cmake_minimum_required(VERSION 3.13)
project(imgui)

add_library(${PROJECT_NAME} STATIC
        src/imconfig.h
        src/imgui_demo.cpp
        src/imgui.cpp
        src/imgui.h
        src/imgui_draw.cpp
        src/imgui_internal.h
        src/imgui_widgets.cpp
        src/imgui_tables.cpp
        src/imstb_textedit.h
        src/imgui_stdlib.h
        src/imgui_stdlib.cpp
        )

target_include_directories(${PROJECT_NAME} PUBLIC ./src)
target_link_libraries(${PROJECT_NAME} stb)
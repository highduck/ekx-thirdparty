cmake_minimum_required(VERSION 3.13)
project(gui-fonts)

add_library(${PROJECT_NAME} INTERFACE)
target_include_directories(${PROJECT_NAME} INTERFACE ./src)
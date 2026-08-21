cmake_minimum_required(VERSION 3.10)
project(BetterWolt)

set(CMAKE_CXX_STANDARD 17)

set(COMMON_SOURCES
    Add.cpp
    App.cpp
    client.py
    deleteCommand.cpp
    ICommand.cpp
    PatchCommand.cpp
    PostCommand.cpp
    TCPServer.cpp
    User.cpp
    storageManagment.cpp 
    Commands.cpp
    HelpCommand.cpp
    product.cpp
    productMangment.cpp
    userMangement.cpp
    RecommendationEngine.cpp
)

add_executable(better_wolt ${COMMON_SOURCES} Main.cpp)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/heads/main.zip
)
FetchContent_MakeAvailable(googletest)

add_executable(runTests 
    ${COMMON_SOURCES} 
    Delete_Tests.cpp 
    Get_Tests.cpp 
    postTests.cpp
    patchTests.cpp
    HelpCommandtest.cpp
)

target_link_libraries(runTests gtest_main)
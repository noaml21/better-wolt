FROM gcc:latest

RUN apt-get update && apt-get install -y cmake

WORKDIR /usr/src/app

COPY . .

RUN mkdir build && cd build && cmake .. && make

EXPOSE 8080

WORKDIR /usr/src/app/build

CMD ["./better_wolt"]
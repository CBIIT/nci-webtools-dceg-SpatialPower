#!/bin/sh

docker rm -f spatial-power spatial-power-processor
docker build -t cbiitss/spatial-power -f app.dockerfile ..
docker run -d -p 80:8000 --name spatial-power --restart always cbiitss/spatial-power
docker run -d --name spatial-power-processor --restart always cbiitss/spatial-power npm run start-queue-worker
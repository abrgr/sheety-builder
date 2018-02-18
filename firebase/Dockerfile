FROM node:8.9.4-slim

RUN apt-get update \
  && apt-get install --assume-yes python \
  && yarn global add firebase-tools \
  && rm -rf /var/lib/apt/lists/*

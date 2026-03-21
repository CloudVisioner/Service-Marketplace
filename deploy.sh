#!/bin/bash

# PRODUCTION
git reset --hard
git checkout master
git pull origin master

# The --build flag is CRITICAL to bake in your new NEXT_PUBLIC variables
docker compose up -d --build
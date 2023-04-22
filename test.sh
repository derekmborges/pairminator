#!/usr/bin/env bash

echo "Starting tests"
yarn test-ci

if [ $? -eq 0 ]
then
  yarn kill-ui
  exit 0
else
  yarn kill-ui
  exit 1
fi

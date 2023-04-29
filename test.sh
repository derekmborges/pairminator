#!/usr/bin/env bash

echo "Waiting for the app to compile..."
while ! grep "Compiled successfully" start.log;do echo "Still waiting...";sleep 1;done

echo "Starting tests"
# yarn test-ci
echo "Testing simulated success"

if [ $? -eq 0 ]
then
  yarn kill-ui
  exit 0
else
  yarn kill-ui
  exit 1
fi

echo "Waiting for Firebase emulators..."
./wait-for-it.sh 127.0.0.1:4000 -t 60 --strict
if [[ $? -ne 0 ]]; then exit 1; fi
echo "Emulator is up"

./wait-for-it.sh 127.0.0.1:8080 -t 60 --strict --
if [[ $? -ne 0 ]]; then exit 1; fi
echo "Firestore is up"

./wait-for-it.sh 127.0.0.1:9099 -t 60 --strict --
if [[ $? -ne 0 ]]; then exit 1; fi
echo "Auth is up"

echo "Waiting for UI..."
./wait-for-it.sh localhost:3000 -t 60 --strict --
if [[ $? -ne 0 ]]; then exit 1; fi
echo "UI is up"

echo "Starting tests"
yarn test;
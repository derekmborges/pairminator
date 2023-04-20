echo "Waiting for UI..."
./wait-for-it.sh localhost:3000 -t 60 --strict -- echo "UI is up"

echo "Waiting for Firebase emulators..."
./wait-for-it.sh 127.0.0.1:4000 -t 60 --strict -- echo "Firebase is up"

echo "Starting tests"
yarn test;
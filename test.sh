echo "Waiting for UI..."
./wait-for-it.sh http://localhost:3000 -- echo "UI is up"

echo "Waiting for Firebase emulators..."
./wait-for-it.sh http://127.0.0.1:4000 -- echo "Firebase is up"

echo "Starting tests"
yarn test;
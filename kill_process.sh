#!/bin/bash

PORT=${1:-3000}

echo "🔎 Checking processes using port $PORT..."
echo

# Show processes
sudo lsof -i:$PORT

echo
echo "🐳 Checking Docker containers exposing port $PORT..."
echo

DOCKER_CONTAINERS=$(docker ps --filter "publish=$PORT" --format "{{.ID}} {{.Names}} {{.Ports}}")

if [ -z "$DOCKER_CONTAINERS" ]; then
    echo "No Docker containers exposing port $PORT"
else
    echo "$DOCKER_CONTAINERS"
fi

echo
read -p "Do you want to free port $PORT? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 0
fi

echo
echo "🛑 Stopping Docker containers..."

for C in $(docker ps --filter "publish=$PORT" --format "{{.ID}}"); do
    NAME=$(docker inspect --format '{{.Name}}' $C | sed 's/\///')
    echo "Stopping container $NAME ($C)"
    docker stop $C
done

echo
echo "🔪 Killing remaining host processes..."

PIDS=$(sudo lsof -t -i:$PORT)

if [ -z "$PIDS" ]; then
    echo "✅ No remaining processes using port $PORT"
else
    for PID in $PIDS; do
        echo "Killing PID $PID"
        sudo kill -9 $PID
    done
fi

echo
echo "✅ Port $PORT should now be free."

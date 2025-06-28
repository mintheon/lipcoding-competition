#!/bin/bash

echo "🔧 Starting Backend Server in Background"
echo "======================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if backend is already running
if [ -f "backend.pid" ]; then
    PID=$(cat backend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Backend server is already running (PID: $PID)"
        echo "🌐 Backend API: http://localhost:8080/api"
        echo "📚 API Docs: http://localhost:8080/swagger-ui"
        exit 0
    else
        echo "🧹 Cleaning up stale backend PID file"
        rm backend.pid
    fi
fi

# Start backend server in background
echo "🔧 Starting backend server..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

echo "✅ Backend server started successfully!"
echo "📋 Details:"
echo "   PID: $BACKEND_PID"
echo "   API: http://localhost:8080/api"
echo "   Docs: http://localhost:8080/swagger-ui"
echo "   Logs: tail -f backend.log"
echo ""
echo "📊 Commands:"
echo "   npm run stop:backend  - Stop backend"
echo "   npm run status        - Check status"
echo ""

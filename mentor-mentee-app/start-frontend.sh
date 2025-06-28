#!/bin/bash

echo "🌐 Starting Frontend Server in Background"
echo "========================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if frontend is already running
if [ -f "frontend.pid" ]; then
    PID=$(cat frontend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Frontend server is already running (PID: $PID)"
        echo "🌐 Frontend: http://localhost:3000"
        exit 0
    else
        echo "🧹 Cleaning up stale frontend PID file"
        rm frontend.pid
    fi
fi

# Check if backend is running
if [ ! -f "backend.pid" ]; then
    echo "⚠️  Backend server is not running!"
    echo "💡 Start backend first with: npm run backend:bg"
    echo ""
    read -p "Do you want to start backend first? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run backend:bg
        echo "⏳ Waiting for backend to start..."
        sleep 3
    else
        echo "❌ Frontend requires backend to be running"
        exit 1
    fi
fi

# Start frontend server in background
echo "🌐 Starting frontend server..."
nohup node frontend.js > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid

echo "✅ Frontend server started successfully!"
echo "📋 Details:"
echo "   PID: $FRONTEND_PID"
echo "   URL: http://localhost:3000"
echo "   Logs: tail -f frontend.log"
echo ""
echo "📊 Commands:"
echo "   npm run stop:frontend - Stop frontend"
echo "   npm run status        - Check status"
echo ""

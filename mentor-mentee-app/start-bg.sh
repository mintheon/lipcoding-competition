#!/bin/bash

echo "🚀 Starting Mentor-Mentee Platform in Background"
echo "=============================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js (https://nodejs.org/) and try again"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo ""
fi

# Check if servers are already running
if [ -f "backend.pid" ]; then
    PID=$(cat backend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Backend server is already running (PID: $PID)"
    else
        echo "🧹 Cleaning up stale backend PID file"
        rm backend.pid
    fi
fi

if [ -f "frontend.pid" ]; then
    PID=$(cat frontend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Frontend server is already running (PID: $PID)"
    else
        echo "🧹 Cleaning up stale frontend PID file"
        rm frontend.pid
    fi
fi

# Start backend server in background
if [ ! -f "backend.pid" ]; then
    echo "🔧 Starting backend server in background..."
    nohup node server.js > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    echo "📄 Backend logs: backend.log"
fi

# Wait a moment for backend to start
sleep 2

# Start frontend server in background
if [ ! -f "frontend.pid" ]; then
    echo "🌐 Starting frontend server in background..."
    nohup node frontend.js > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    echo "📄 Frontend logs: frontend.log"
fi

echo ""
echo "🎉 Application started successfully!"
echo "==================================="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080/api"
echo "API Docs: http://localhost:8080/swagger-ui"
echo ""
echo "📊 Useful commands:"
echo "  npm run status      - Check server status"
echo "  npm run stop:bg     - Stop all servers"
echo "  tail -f backend.log - View backend logs"
echo "  tail -f frontend.log - View frontend logs"
echo ""

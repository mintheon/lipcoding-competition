#!/bin/bash

echo "🚀 Starting Mentor-Mentee Matching Platform"
echo "=========================================="
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

# Start the backend server
echo "🔧 Starting backend server on port 8080..."
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start the frontend server
echo "🌐 Starting frontend server on port 3000..."
node frontend.js &
FRONTEND_PID=$!

echo ""
echo "🎉 Application is starting up!"
echo "================================"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080/api"
echo "API Docs: http://localhost:8080/swagger-ui"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for servers
wait

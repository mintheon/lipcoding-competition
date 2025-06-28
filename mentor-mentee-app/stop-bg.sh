#!/bin/bash

echo "🛑 Stopping Mentor-Mentee Platform"
echo "================================="
echo ""

STOPPED=false

# Stop backend server
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm backend.pid
        echo "✅ Backend server stopped"
        STOPPED=true
    else
        echo "⚠️  Backend server was not running"
        rm backend.pid
    fi
else
    echo "ℹ️  No backend PID file found"
fi

# Stop frontend server
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🌐 Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm frontend.pid
        echo "✅ Frontend server stopped"
        STOPPED=true
    else
        echo "⚠️  Frontend server was not running"
        rm frontend.pid
    fi
else
    echo "ℹ️  No frontend PID file found"
fi

if [ "$STOPPED" = true ]; then
    echo ""
    echo "🎉 All servers stopped successfully!"
else
    echo ""
    echo "ℹ️  No servers were running"
fi

echo ""

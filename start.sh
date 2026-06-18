#!/bin/bash

# Cloudbyz Blog Sandbox Portals Starter Script

echo "============================================="
echo "🚀 Cloudbyz HubSpot vs AWS Sandbox Portals"
echo "============================================="

# Ensure .env exists
if [ ! -f .env ]; then
    echo "⚠️  Error: .env file not found. Please create one with your HubSpot credentials."
    exit 1
fi

# Start HubSpot SSR API (Port 3000) in the background
echo "🟢 Starting HubSpot SSR API on http://localhost:3000..."
node hubspot/hubspot.js > /dev/null 2>&1 &
HUBSPOT_PID=$!

# Trap SIGINT (Ctrl+C) and kill background process before exiting
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $HUBSPOT_PID 2>/dev/null
    echo "👋 Sandbox stopped."
    exit 0
}
trap cleanup SIGINT

# Wait a brief moment for the API to boot
sleep 1

# Start PHP Server (Port 8000) in the foreground
echo "🟢 Starting PHP Web Server on http://localhost:8000..."
echo "---------------------------------------------"
echo "👉 Home Dashboard:      http://localhost:8000/"
echo "👉 HubSpot SSR Portal:  http://localhost:8000/hubspot/"
echo "👉 AWS AJAX Portal:     http://localhost:8000/aws/"
echo "---------------------------------------------"
echo "Press Ctrl+C to stop all servers."
echo ""

php -S localhost:8000

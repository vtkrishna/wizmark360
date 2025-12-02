#!/bin/bash

# WAI SDK v1.0 - Startup Script
# Initializes and runs the WAI SDK orchestration system

echo "🚀 WAI SDK v1.0 - Startup Script"
echo "================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found"
    echo "   Using environment variables from Replit Secrets"
else
    echo "✅ .env file found"
fi

# Verify API keys
echo ""
echo "🔑 Checking API Keys..."

check_key() {
    if [ -z "${!1}" ]; then
        echo "   ❌ $1 not set"
        return 1
    else
        echo "   ✅ $1 configured"
        return 0
    fi
}

KEY_COUNT=0
check_key "OPENAI_API_KEY" && ((KEY_COUNT++))
check_key "ANTHROPIC_API_KEY" && ((KEY_COUNT++))
check_key "GEMINI_API_KEY" && ((KEY_COUNT++))
check_key "XAI_API_KEY" && ((KEY_COUNT++))
check_key "PERPLEXITY_API_KEY" && ((KEY_COUNT++))
check_key "COHERE_API_KEY" && ((KEY_COUNT++))

echo ""
echo "📊 $KEY_COUNT API keys configured"

if [ $KEY_COUNT -eq 0 ]; then
    echo ""
    echo "❌ No API keys found!"
    echo "   Please configure at least one LLM provider:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - GEMINI_API_KEY"
    echo ""
    echo "   In Replit: Use Secrets tab to add keys"
    echo "   Locally: Copy .env.example to .env and add keys"
    exit 1
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Run example or start server
echo ""
echo "🎯 Choose startup mode:"
echo "   1) Run basic example"
echo "   2) Run streaming example"
echo "   3) Start Express server"
echo "   4) Build only (no run)"
echo ""

if [ -z "$1" ]; then
    MODE="3"
else
    MODE="$1"
fi

case $MODE in
    1)
        echo "🚀 Running basic example..."
        npx tsx examples/basic.ts
        ;;
    2)
        echo "🚀 Running streaming example..."
        npx tsx examples/streaming.ts
        ;;
    3)
        echo "🚀 Starting Express server..."
        npx tsx examples/express-server.ts
        ;;
    4)
        echo "✅ Build complete. Ready to use!"
        ;;
    *)
        echo "❌ Invalid mode: $MODE"
        exit 1
        ;;
esac

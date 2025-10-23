#!/bin/bash

echo "🔧 FaceFace App - MongoDB Setup Script"
echo "======================================"
echo ""

# Fix npm cache permissions if needed
echo "Step 1: Fixing npm cache permissions..."
if [ -d "$HOME/.npm" ]; then
    sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
    echo "✅ npm cache permissions fixed"
else
    echo "✅ npm cache is clean"
fi
echo ""

# Install/update dependencies
echo "Step 2: Installing Node.js dependencies..."
cd "$(dirname "$0")/backend"
npm uninstall pg pg-pool 2>/dev/null
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Check if MongoDB is installed
echo "Step 3: Checking MongoDB installation..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    
    # Check if MongoDB is running
    if pgrep -x mongod > /dev/null; then
        echo "✅ MongoDB is already running"
    else
        echo "⚠️  MongoDB is installed but not running"
        echo "Starting MongoDB..."
        
        # Try to start with Homebrew
        if command -v brew &> /dev/null; then
            brew services start mongodb-community
            echo "✅ MongoDB started via Homebrew"
        else
            echo "❌ Please start MongoDB manually: mongod --config /usr/local/etc/mongod.conf"
        fi
    fi
else
    echo "❌ MongoDB is NOT installed"
    echo ""
    echo "Please install MongoDB using ONE of these methods:"
    echo ""
    echo "Option 1 - Homebrew (Recommended):"
    echo "  1. Fix Homebrew permissions:"
    echo "     sudo chown -R \$(whoami) /usr/local/Cellar /usr/local/Homebrew /usr/local/bin /usr/local/etc /usr/local/include /usr/local/lib /usr/local/opt /usr/local/sbin /usr/local/share /usr/local/var/homebrew"
    echo "  2. Install MongoDB:"
    echo "     brew install mongodb-community"
    echo "  3. Start MongoDB:"
    echo "     brew services start mongodb-community"
    echo ""
    echo "Option 2 - Docker:"
    echo "  docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
    echo "Option 3 - Direct Download:"
    echo "  https://www.mongodb.com/try/download/community"
    echo ""
    echo "After installing MongoDB, run this script again."
    exit 1
fi
echo ""

# Test MongoDB connection
echo "Step 4: Testing MongoDB connection..."
npm run test-mongo
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup Complete! Your app is ready to run."
    echo ""
    echo "To start the server, run:"
    echo "  cd backend"
    echo "  npm start"
    echo ""
    echo "Then visit: http://localhost:3000"
else
    echo ""
    echo "⚠️  MongoDB connection test failed"
    echo "Please check that MongoDB is running and try again."
    echo ""
    echo "For help, see QUICK_START.md or MONGODB_SETUP.md"
fi





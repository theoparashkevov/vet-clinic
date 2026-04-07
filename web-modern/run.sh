#!/bin/bash

# Vet Clinic Web Modern - Run Script
# This script temporarily switches to a compatible Node.js version using nvm
# without affecting your system Node.js installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vet Clinic Web Modern - Development Server${NC}"
echo ""

# Check if nvm is installed
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi

if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
else
    echo -e "${RED}❌ nvm (Node Version Manager) is not installed${NC}"
    echo ""
    echo "Please install nvm first:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo ""
    echo "Or visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Get current Node version
CURRENT_NODE=$(node --version 2>/dev/null || echo "none")
echo -e "${BLUE}Current Node.js version:${NC} $CURRENT_NODE"

# Required Node.js version (Vite 8 needs 20.19+ or 22.12+)
REQUIRED_NODE="22.12.0"
ALTERNATIVE_NODE="20.19.0"

# Function to install and use a specific Node version
use_node_version() {
    local version=$1
    
    echo -e "${YELLOW}📦 Checking Node.js $version...${NC}"
    
    # Check if the version is already installed
    if ! nvm list | grep -q "v$version"; then
        echo -e "${YELLOW}⬇️  Node.js $version not found. Installing...${NC}"
        nvm install "$version"
    fi
    
    echo -e "${GREEN}✅ Using Node.js $version${NC}"
    nvm use "$version"
}

# Try to use compatible Node version
if nvm list | grep -q "v$REQUIRED_NODE"; then
    use_node_version "$REQUIRED_NODE"
elif nvm list | grep -q "v$ALTERNATIVE_NODE"; then
    use_node_version "$ALTERNATIVE_NODE"
else
    echo -e "${YELLOW}⚠️  Compatible Node.js version not found${NC}"
    echo ""
    echo "This project requires Node.js 20.19+ or 22.12+ (you have 22.2.0)"
    echo ""
    echo "Choose an option:"
    echo "  1) Install Node.js $REQUIRED_NODE (recommended)"
    echo "  2) Install Node.js $ALTERNATIVE_NODE"
    echo "  3) Exit"
    echo ""
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            use_node_version "$REQUIRED_NODE"
            ;;
        2)
            use_node_version "$ALTERNATIVE_NODE"
            ;;
        *)
            echo -e "${RED}❌ Exiting${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}✅ Node.js $(node --version) is now active${NC}"
echo -e "${BLUE}📝 Note: This only affects the current terminal session${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
else
    # Check if node_modules was installed with a different Node version
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    # Check for critical missing native bindings (Rolldown)
    if [ ! -f "node_modules/@rolldown/binding-linux-x64-gnu/package.json" ] 2>/dev/null || \
       [ ! -d "node_modules/rolldown" ] 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Native bindings missing or incompatible with current Node version${NC}"
        echo -e "${YELLOW}📦 Cleaning and reinstalling dependencies...${NC}"
        rm -rf node_modules package-lock.json
        npm install
        echo ""
    else
        # Check if we need to verify all dependencies are present
        if ! npm ls zustand @tanstack/react-router framer-motion >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Some dependencies are missing${NC}"
            echo -e "${YELLOW}📦 Installing missing dependencies...${NC}"
            npm install
            echo ""
        fi
    fi
fi

# Generate TanStack Router routes
if ! [ -f "src/routeTree.gen.ts" ]; then
    echo -e "${YELLOW}🔄 Generating route tree...${NC}"
    npm run generate-routes 2>/dev/null || echo -e "${YELLOW}⚠️  Route generation script not found. Routes will be generated on first dev server run.${NC}"
    echo ""
fi

# Run the dev server
echo -e "${GREEN}🚀 Starting development server...${NC}"
echo -e "${BLUE}   Press Ctrl+C to stop${NC}"
echo ""
npm run dev

#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up SBOM Generator...${NC}\n"

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed.${NC}"
        echo -e "Please install $1 using your system's package manager."
        exit 1
    fi
}

# Function to set up environment file
setup_env() {
    if [ ! -f .env ]; then
        echo -e "\n${YELLOW}🔧 Creating .env file...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ .env file created from example${NC}"
        else
            echo "NVD_API_KEY=" > .env
            echo -e "${GREEN}✓ Basic .env file created${NC}"
        fi
    else
        echo -e "${GREEN}✓ .env file already exists${NC}"
    fi
}

# Function to check and install npm dependencies
install_dependencies() {
    echo -e "\n${GREEN}📦 Checking dependencies...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚙️  First-time installation detected${NC}"
        if ! npm install; then
            echo -e "${RED}❌ Installation failed${NC}"
            exit 1
        fi
    elif [ "$(find package.json -newer package-lock.json)" ]; then
        echo -e "${YELLOW}⚙️  Dependency updates detected${NC}"
        if ! npm update; then
            echo -e "${RED}❌ Update failed${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Dependencies already up-to-date${NC}"
    fi
}

# Function to show installation summary
show_summary() {
    echo -e "\n${BLUE}📋 Installation Summary:${NC}"
    echo -e "${GREEN}✓ System requirements checked${NC}"
    echo -e "${GREEN}✓ Node.js version verified${NC}"
    echo -e "${GREEN}✓ Environment file created${NC}"
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    if [ -d .git ]; then
        echo -e "${GREEN}✓ Git repository initialized${NC}"
    fi
    echo -e "${GREEN}✓ Build completed${NC}"
}

# Function to find available port
find_available_port() {
    local port=5000
    while lsof -i :$port >/dev/null; do
        port=$((port+1))
    done
    echo $port
}

# Function to build the application
build_app() {
    echo -e "\n${GREEN}🏗️  Building application...${NC}"
    if ! npm run build; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Build completed successfully${NC}"
}

# Function to start the application
start_app() {
    echo -e "\n${GREEN}🚀 Starting SBOM Generator...${NC}"
    
    # Kill any existing process on the port
    if lsof -ti :$PORT >/dev/null; then
        echo -e "${YELLOW}⚠️  Port $PORT is in use. Stopping existing process...${NC}"
        kill -9 $(lsof -ti :$PORT) 2>/dev/null
    fi
    
    if ! PORT=$PORT npm run start; then
        echo -e "${RED}❌ Failed to start SBOM Generator${NC}"
        exit 1
    fi
}

# Check required commands
echo -e "${GREEN}🔍 Checking system requirements...${NC}"
check_command "node"
check_command "npm"

# Verify Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version must be 18.0.0 or higher${NC}"
    echo -e "Current version: ${NODE_VERSION}"
    echo -e "Please upgrade Node.js and try again"
    exit 1
fi

# Set up environment
setup_env

# Install dependencies
install_dependencies

# Initialize Git if not already a repository
if [ ! -d .git ]; then
    echo -e "\n${GREEN}🔧 Initializing Git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
    echo -e "${GREEN}✓ Git repository initialized${NC}"
fi

# Find available port
APP_PORT=$(find_available_port)
export PORT=$APP_PORT

# Build the application
build_app

# Show installation summary
show_summary

echo -e "\n${GREEN}✅ Installation complete!${NC}"

# Application access instructions
echo -e "\n${YELLOW}🌐 Accessing the Application:${NC}"
echo -e "1. The application will start automatically"
echo -e "2. Access the application at:"
echo -e "   • Local:   ${GREEN}http://localhost:$APP_PORT${NC}"
echo -e "   • Network: ${GREEN}http://0.0.0.0:$APP_PORT${NC}"

echo -e "\n${YELLOW}🔑 NVD Integration:${NC}"
echo -e "• To enable vulnerability scanning:"
echo "  1. Get an API key from https://nvd.nist.gov/developers/request-an-api-key"
echo "  2. Add it to .env file: NVD_API_KEY=your-key-here"
echo "  3. The key will be loaded automatically - no restart needed"

if [ -d .git ]; then
    echo -e "\n${YELLOW}📝 GitHub Integration:${NC}"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
fi

# Verify the complete installation
echo -e "\n${GREEN}🔍 Final Verification:${NC}"
if [ -f package.json ] && [ -d node_modules ] && [ -f .env ] && [ -d dist ]; then
    echo -e "${GREEN}✓ All components are installed correctly${NC}"
    echo -e "${GREEN}✓ Ready to start!${NC}"
    echo -e "\n${BLUE}Starting SBOM Generator... 🎉${NC}"
else
    echo -e "${RED}⚠️  Some components are missing. Please check the logs above for errors.${NC}"
    exit 1
fi

# Start the application
start_app
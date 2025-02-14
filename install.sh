#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
        echo "NVD_API_KEY=" > .env
        echo -e "${YELLOW}⚠️  Important: You need an NVD API key to use vulnerability tracking features.${NC}"
        echo "Get your key at: https://nvd.nist.gov/developers/request-an-api-key"
        echo -e "Then add it to the .env file: NVD_API_KEY=your-key-here\n"
    else
        echo -e "${GREEN}✓ .env file already exists${NC}"
    fi
}

# Function to check and install npm dependencies
install_dependencies() {
    echo -e "\n${GREEN}📦 Installing dependencies...${NC}"
    if [ ! -f package-lock.json ]; then
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install dependencies${NC}"
            exit 1
        fi
    else
        npm ci
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install dependencies${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
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

echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo -e "\n${YELLOW}To start the development server:${NC}"
echo -e "npm run dev"
echo -e "\n${YELLOW}Don't forget to:${NC}"
echo "1. Add your NVD API key to the .env file"
echo "2. Visit https://nvd.nist.gov/developers/request-an-api-key to get an API key if you don't have one"

if [ -d .git ]; then
    echo -e "\n${YELLOW}To push to your GitHub repository:${NC}"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
fi

# Verify the installation
echo -e "\n${GREEN}🔍 Verifying installation...${NC}"
if [ -f package.json ] && [ -d node_modules ] && [ -f .env ]; then
    echo -e "${GREEN}✓ Basic setup looks good${NC}"
    echo -e "${GREEN}✓ Ready to start development!${NC}"
else
    echo -e "${RED}⚠️  Some components may be missing. Please check the logs above for errors.${NC}"
fi
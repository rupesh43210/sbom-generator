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
        echo "NVD_API_KEY=" > .env
        echo -e "${GREEN}✓ .env file created${NC}"
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
            echo -e "${RED}Please check your internet connection and try again${NC}"
            exit 1
        fi
    else
        npm ci
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install dependencies${NC}"
            echo -e "${RED}Try removing node_modules and package-lock.json, then run the script again${NC}"
            exit 1
        fi
    fi

    # Verify critical dependencies
    if [ ! -d "node_modules/@tanstack" ] || [ ! -d "node_modules/react" ]; then
        echo -e "${RED}❌ Critical dependencies are missing${NC}"
        echo -e "${RED}Please try running 'npm install' manually${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
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

# Show installation summary
show_summary

echo -e "\n${GREEN}✅ Installation complete!${NC}"

# Application access instructions
echo -e "\n${YELLOW}🌐 Accessing the Application:${NC}"
echo -e "1. Start the development server:"
echo -e "   ${GREEN}npm run dev${NC}"
echo -e "\n2. Once started, access the application at:"
echo -e "   • Local:   ${GREEN}http://localhost:5000${NC}"
echo -e "   • Network: ${GREEN}http://0.0.0.0:5000${NC}"
echo -e "   The app will be available on port 5000 by default"

echo -e "\n${YELLOW}🔑 NVD Integration (Optional):${NC}"
echo -e "• The application will work without an NVD API key"
echo -e "• Basic SBOM generation and management will function normally"
echo -e "• To enable vulnerability scanning features later:"
echo "  1. Get an API key from https://nvd.nist.gov/developers/request-an-api-key"
echo "  2. Add it to .env file: NVD_API_KEY=your-key-here"

if [ -d .git ]; then
    echo -e "\n${YELLOW}📝 GitHub Integration:${NC}"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
fi

# Verify the complete installation
echo -e "\n${GREEN}🔍 Final Verification:${NC}"
if [ -f package.json ] && [ -d node_modules ] && [ -f .env ]; then
    echo -e "${GREEN}✓ All components are installed correctly${NC}"
    echo -e "${GREEN}✓ Ready to start development!${NC}"
    echo -e "\n${BLUE}Happy coding! 🎉${NC}"
else
    echo -e "${RED}⚠️  Some components may be missing. Please check the logs above for errors.${NC}"
fi
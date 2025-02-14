#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error handling
set -e
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'echo -e "${RED}❌ Command \"${last_command}\" failed with exit code $?.${NC}"' EXIT

echo -e "${GREEN}🚀 Setting up SBOM Generator...${NC}\n"

# Function to detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

# Function to check system requirements
check_system_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check memory
    total_memory=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$total_memory" -lt 1024 ]; then
        echo -e "${YELLOW}⚠️  Warning: Less than 1GB RAM available${NC}"
    fi
    
    # Check disk space
    free_space=$(df -m . | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 1024 ]; then
        echo -e "${YELLOW}⚠️  Warning: Less than 1GB free disk space${NC}"
    fi
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        echo -e "${RED}❌ Please do not run this script as root${NC}"
        exit 1
    fi
}

# Function to install Node.js and npm on different distributions
install_node() {
    local DISTRO=$(detect_distro)
    echo -e "${YELLOW}📦 Installing Node.js and npm on $DISTRO...${NC}"
    
    case $DISTRO in
        "ubuntu"|"debian")
            echo -e "${BLUE}📦 Adding NodeSource repository...${NC}"
            sudo apt-get update || { echo -e "${RED}❌ Failed to update package list${NC}"; exit 1; }
            sudo apt-get install -y curl || { echo -e "${RED}❌ Failed to install curl${NC}"; exit 1; }
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - || { echo -e "${RED}❌ Failed to add NodeSource repository${NC}"; exit 1; }
            sudo apt-get install -y nodejs || { echo -e "${RED}❌ Failed to install Node.js${NC}"; exit 1; }
            ;;
        "fedora")
            sudo dnf install -y nodejs npm || { echo -e "${RED}❌ Failed to install Node.js and npm${NC}"; exit 1; }
            ;;
        "centos"|"rhel")
            sudo yum install -y nodejs npm || { echo -e "${RED}❌ Failed to install Node.js and npm${NC}"; exit 1; }
            ;;
        "arch")
            sudo pacman -Sy nodejs npm || { echo -e "${RED}❌ Failed to install Node.js and npm${NC}"; exit 1; }
            ;;
        *)
            echo -e "${RED}❌ Unsupported distribution: $DISTRO${NC}"
            echo -e "Please install Node.js (v18+) and npm manually from https://nodejs.org"
            exit 1
            ;;
    esac
    
    # Verify installation
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Node.js or npm installation failed${NC}"
        exit 1
    fi
}

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed.${NC}"
        if [ "$1" = "node" ] || [ "$1" = "npm" ]; then
            echo -e "${YELLOW}🔧 Attempting to install Node.js and npm...${NC}"
            install_node
        else
            echo -e "Please install $1 using your system's package manager."
            exit 1
        fi
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

# Main installation process
main() {
    # Print welcome message
    echo -e "${BLUE}Welcome to SBOM Generator Installation${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
    
    # Check system requirements
    check_system_requirements
    
    # Check and install required commands
    echo -e "${GREEN}🔍 Checking dependencies...${NC}"
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
    
    # Build the application
    build_app
    
    # Find available port
    APP_PORT=$(find_available_port)
    export PORT=$APP_PORT
    
    # Show installation summary
    show_summary
    
    echo -e "\n${GREEN}✅ Installation complete!${NC}"
    
    # Application access instructions
    echo -e "\n${YELLOW}🌐 Accessing the Application:${NC}"
    echo -e "1. The application will start automatically"
    echo -e "2. Access the application at:"
    echo -e "   • Local:   ${GREEN}http://localhost:$APP_PORT${NC}"
    echo -e "   • Network: ${GREEN}http://$(hostname -I | awk '{print $1}'):$APP_PORT${NC}"
    
    echo -e "\n${YELLOW}🔑 NVD Integration:${NC}"
    echo -e "• To enable vulnerability scanning:"
    echo "  1. Get an API key from https://nvd.nist.gov/developers/request-an-api-key"
    echo "  2. Add it to your .env file: NVD_API_KEY=your-key-here"
    
    # Start the application
    start_app
}

# Run main installation
main
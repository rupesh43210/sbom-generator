#!/bin/bash

echo "🚀 Setting up SBOM Generator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    echo "NVD_API_KEY=" > .env
    echo "⚠️ Please add your NVD API key to the .env file"
fi

# Initialize Git if not already a repository
if [ ! -d .git ]; then
    echo "🔧 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
fi

echo "✨ Installation complete!"
echo ""
echo "To start the development server:"
echo "npm run dev"
echo ""
echo "Don't forget to:"
echo "1. Add your NVD API key to the .env file"
echo "2. Visit https://nvd.nist.gov/developers/request-an-api-key to get an API key if you don't have one"
echo ""
if [ -d .git ]; then
    echo "To push to your GitHub repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
    echo ""
fi
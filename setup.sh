#!/bin/bash

# Exit on error
set -e

# Setup Colors for Better Output
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"

# Function to print success messages
function print_success() {
  echo -e "${GREEN}${BOLD}$1${RESET}"
}

# Function to print error messages
function print_error() {
  echo -e "${RED}${BOLD}$1${RESET}"
}

# Function to print warning messages
function print_warning() {
  echo -e "${YELLOW}${BOLD}$1${RESET}"
}

# Check Node.js installation
if ! command -v node &> /dev/null; then
  print_error "❌ Node.js is not installed. Please install it from https://nodejs.org/"
  exit 1
else
  print_success "✅ Node.js is installed: $(node -v)"
fi

# Check npm installation
if ! command -v npm &> /dev/null; then
  print_error "❌ npm is not installed. Please install it."
  exit 1
else
  print_success "✅ npm is installed: $(npm -v)"
fi

# Check Python3 installation
if ! command -v python3 &> /dev/null; then
  print_error "❌ Python3 is not installed. Please install it from https://www.python.org/"
  exit 1
else
  print_success "✅ Python3 is installed: $(python3 --version)"
fi

# Check pip3 installation
if ! command -v pip3 &> /dev/null; then
  print_warning "❌ pip3 is not installed. Installing pip3..."
  curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  python3 get-pip.py
  rm get-pip.py
  print_success "✅ pip3 installed successfully."
else
  print_success "✅ pip3 is installed: $(pip3 --version)"
fi

# Check if Python virtual environment is available
if ! python3 -m ensurepip &> /dev/null; then
  print_warning "⚠️ venv is not available. Installing the python3-venv package..."
  sudo apt install -y python3-venv
else
  print_success "✅ venv is available."
fi

# Create and activate a Python virtual environment (in venv directory)
if [ ! -d "venv" ]; then
  print_success "Creating a Python virtual environment..."
  python3 -m venv venv
  print_success "✅ Virtual environment created."
fi

# Activate the virtual environment before installing dependencies
source venv/bin/activate
print_success "✅ Python virtual environment activated."

# Install Python dependencies
print_success "Installing Python dependencies..."
pip3 install --upgrade pip  # Ensure pip is up-to-date
pip3 install -r requirements.txt
print_success "✅ Python dependencies installed."

# Deactivate the virtual environment
deactivate
print_success "✅ Python virtual environment deactivated."

# Install Node.js dependencies
print_success "Installing Node.js dependencies..."
npm install --force  # Handle potential peer dependency conflicts
print_success "✅ Node.js dependencies installed."

# Build TypeScript to JavaScript
print_success "Building TypeScript code..."
npm run build  # This runs `tsc` as defined in your package.json scripts
print_success "✅ TypeScript build completed."

# Add shebang to the top of dist/index.js
print_success "Adding shebang to dist/index.js..."
sed -i '1s/^/#!\/usr\/bin\/env node\n/' dist/index.js
print_success "✅ Shebang added to dist/index.js."

# Link the build output using npm link
print_success "Linking build output using npm link..."
npm link
print_success "✅ Build output linked."

# Check for global npm bin directory and add it to PATH if not present
NPM_BIN_DIR=$(npm bin -g)
if ! echo "$PATH" | grep -q "$NPM_BIN_DIR"; then
  print_warning "⚠️ Global npm bin directory not in PATH. Adding it..."
  export PATH="$PATH:$NPM_BIN_DIR"
  echo "export PATH=\"$PATH\"" >> ~/.zshrc  # Or ~/.bashrc, based on your shell
  source ~/.zshrc  # Reload shell config
  print_success "✅ Global npm bin directory added to PATH."
else
  print_success "✅ Global npm bin directory is already in PATH."
fi

# Final message
print_success "🎉 Setup complete! You're ready to use the CLI tool."

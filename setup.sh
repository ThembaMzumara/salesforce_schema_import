#!/bin/bash

# Check Node.js installation
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
  exit 1
else
  echo "✅ Node.js is installed: $(node -v)"
fi

# Check npm installation
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install it."
  exit 1
else
  echo "✅ npm is installed: $(npm -v)"
fi

# Check Python3 installation
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 is not installed. Please install it from https://www.python.org/"
  exit 1
else
  echo "✅ Python3 is installed: $(python3 --version)"
fi

# Check pip3 installation
if ! command -v pip3 &> /dev/null; then
  echo "❌ pip3 is not installed. Installing pip3..."
  curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  python3 get-pip.py
  rm get-pip.py
  echo "✅ pip3 installed successfully."
else
  echo "✅ pip3 is installed: $(pip3 --version)"
fi

# Check if Python virtual environment is available
if ! command -v venv &> /dev/null; then
  echo "⚠️ venv is not available. Installing the python3-venv package..."
  sudo apt install python3-venv
else
  echo "✅ venv is available."
fi

# Create and activate a Python virtual environment (in venv directory)
if [ ! -d "venv" ]; then
  echo "Creating a Python virtual environment..."
  python3 -m venv venv
  echo "✅ Virtual environment created."
fi

# Activate the virtual environment
source venv/bin/activate
echo "✅ Python virtual environment activated."

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt
echo "✅ Python dependencies installed."

# Deactivate the virtual environment (to avoid conflicts with TS)
deactivate
echo "✅ Python virtual environment deactivated."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
echo "✅ Node.js dependencies installed."

# Build TypeScript to JavaScript
echo "Building TypeScript code..."
npm run build  # This runs `tsc` as defined in your package.json scripts
echo "✅ TypeScript build completed."

# Add shebang to the top of dist/index.js
echo "Adding shebang to dist/index.js..."
sed -i '1s/^/#!\/usr\/bin\/env node\n/' dist/index.js
echo "✅ Shebang added to dist/index.js."

# Link the build output using npm link (not manually creating symlink)
echo "Linking build output using npm link..."
npm link
echo "✅ Build output linked."

# Final message
echo "🎉 Setup complete! You're ready to use the CLI tool."
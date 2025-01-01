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

# Check virtualenv installation (optional but recommended)
if ! command -v virtualenv &> /dev/null; then
  echo "⚠️ virtualenv is not installed. Installing virtualenv for Python isolation..."
  pip3 install virtualenv
else
  echo "✅ virtualenv is installed."
fi

# Create and activate a Python virtual environment (optional)
if [ ! -d "python_env" ]; then
  echo "Creating a Python virtual environment..."
  python3 -m virtualenv python_env
  echo "✅ Virtual environment created."
fi

# Activate the virtual environment
source python_env/bin/activate
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

# Final message
echo "🎉 Setup complete! You're ready to use the CLI tool."

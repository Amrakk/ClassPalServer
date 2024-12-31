#!/bin/bash

# Define paths
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
INSTALL_DIR="/usr/local/bin"
COMMANDS_DIR="/usr/local/share/cpserver/commands"
COMPLETION_DIR="/etc/bash_completion.d"

# Ensure /usr/local/bin is writable
if [ ! -w "$INSTALL_DIR" ]; then
  echo "Error: You need write permissions to $INSTALL_DIR."
  exit 1
fi

# Ensure /usr/local/share/cpserver/commands is writable
if [ ! -d "$COMMANDS_DIR" ]; then
  mkdir -p "$COMMANDS_DIR" || { echo "Failed to create $COMMANDS_DIR"; exit 1; }
fi

# Ensure /etc/bash_completion.d is writable
if [ ! -w "$COMPLETION_DIR" ]; then
  echo "Error: You need write permissions to $COMPLETION_DIR."
  exit 1
fi

echo "Installing main cpserver script to $INSTALL_DIR..."
cp "$SCRIPT_DIR/cpserver.sh" "$INSTALL_DIR/cpserver" || { echo "Failed to copy cpserver.sh"; exit 1; }
chmod +x "$INSTALL_DIR/cpserver"

echo "Installing subcommands to $COMMANDS_DIR..."
cp "$SCRIPT_DIR/run-dev.sh" "$COMMANDS_DIR" || { echo "Failed to copy run-dev.sh"; exit 1; }
cp "$SCRIPT_DIR/help.sh" "$COMMANDS_DIR" || { echo "Failed to copy help.sh"; exit 1; }
cp "$SCRIPT_DIR/build.sh" "$COMMANDS_DIR" || { echo "Failed to copy build.sh"; exit 1; }
chmod +x "$COMMANDS_DIR"/*.sh

echo "Installing Bash completion script to $COMPLETION_DIR..."
cp "$SCRIPT_DIR/cpserver-completion.sh" "$COMPLETION_DIR/cpserver" || { echo "Failed to copy cpserver-completion.sh"; exit 1; }
chmod +x "$COMPLETION_DIR/cpserver"

echo "Reloading Bash completion..."
source "$COMPLETION_DIR/cpserver" 2>/dev/null || echo "Completion script will load in the next shell session."

echo "cpserver installed successfully!"
echo "Try running 'cpserver' or pressing Tab for subcommands."

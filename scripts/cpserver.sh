#!/bin/bash

# Base directory for subcommands
BASE_DIR="/usr/local/share/cpserver/commands"

# Check if a subcommand is provided
if [ "$#" -lt 1 ]; then
  echo "Usage: cpserver <subcommand> [options]"
  echo "Available subcommands:"
  ls "$BASE_DIR" | sed 's/.sh$//'
  exit 1
fi

# Extract the subcommand and shift arguments
SUBCOMMAND="$1"
shift

# Target script
TARGET_SCRIPT="$BASE_DIR/$SUBCOMMAND.sh"

# Check if the subcommand exists
if [ -f "$TARGET_SCRIPT" ]; then
  # Run the subcommand script
  bash "$TARGET_SCRIPT" "$@"
else
  echo "Error: Subcommand '$SUBCOMMAND' not found."
  echo "Available subcommands:"
  ls "$BASE_DIR" | sed 's/.sh$//'
  exit 1
fi

#!/bin/bash

# Define the base directory as the current script's directory or a specified path
if [ -n "$1" ] && [[ "$1" != -* ]]; then
  TARGET_DIR="$1"
  shift
else
  TARGET_DIR="$(dirname "$(realpath "$0")")"
fi

# Check if the base directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Specified directory '$TARGET_DIR' does not exist."
  exit 1
fi

# Navigate to the target directory and run the command
cd "$TARGET_DIR" || exit

# Check if 'bun' is installed
if ! command -v bun &> /dev/null; then
  echo "Error: 'bun' is not installed. Please install it first."
  exit 1
fi

# Run the bun dev command
bun run build

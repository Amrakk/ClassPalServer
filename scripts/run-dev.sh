#!/bin/bash

# Define the base directory as the current script's directory or a specified path
if [ -n "$1" ] && [[ "$1" != -* ]]; then
  TARGET_DIR="$1"
  shift
else
  TARGET_DIR="$(dirname "$(realpath "$0")")"
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Specified directory '$TARGET_DIR' does not exist."
  exit 1
fi

# Check if 'bun' is installed
if ! command -v bun &> /dev/null; then
  echo "Error: 'bun' is not installed. Please install it first."
  exit 1
fi

# Function to run 'bun run dev' in a new terminal
run_bun_dev_in_terminal() {
  local dir="$1"
  gnome-terminal --tab -- bash -c "cd \"$dir\" && bun run dev || { echo 'Error: Failed to run bun run dev in $dir'; exit 1; }; exec bash" &
  terminal_pid=$!
  wait "$terminal_pid"
  if ! kill -0 "$terminal_pid" &>/dev/null; then
    kill "$terminal_pid" &>/dev/null
  fi
}

# Variables for flags
PRIORITY_FOLDER=""
RUN_ALL=false
DELAY_AFTER_PRIORITY=5 # Default delay after running priority folder in seconds

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -A|--all)
      RUN_ALL=true
      shift
      ;;
    -P|--prior)
      PRIORITY_FOLDER="$2"
      shift 2
      ;;
    --delay)
      DELAY_AFTER_PRIORITY="$2"
      shift 2
      ;;
    *)
      break
      ;;
  esac
done

if $RUN_ALL; then
  # If priority folder is specified, run it first
  if [ -n "$PRIORITY_FOLDER" ]; then
    PRIORITY_PATH="$TARGET_DIR/$PRIORITY_FOLDER"
    if [ -d "$PRIORITY_PATH" ]; then
      echo "Opening new terminal for priority folder 'bun run dev' in $PRIORITY_PATH"
      run_bun_dev_in_terminal "$PRIORITY_PATH"
      echo "Waiting for $DELAY_AFTER_PRIORITY seconds before starting other processes..."
      sleep "$DELAY_AFTER_PRIORITY"
    else
      echo "Error: Priority folder '$PRIORITY_FOLDER' does not exist in $TARGET_DIR."
    fi
  fi

  # Run 'bun run dev' for up to three other subdirectories in parallel, excluding the priority folder
  count=0
  for subdir in $TARGET_DIR/*; do
    if [ -d "$subdir" ] && [[ "$subdir" != "$PRIORITY_PATH" ]]; then
      echo "Opening new terminal for 'bun run dev' in $subdir"
      run_bun_dev_in_terminal "$subdir"
      count=$((count + 1))
      if [[ $count -ge 3 ]]; then
        break
      fi
    fi
  done
else
  # Run 'bun run dev' in the current directory
  echo "Opening new terminal for 'bun run dev' in $TARGET_DIR"
  cd "$TARGET_DIR" || exit 1
  bun run dev
fi

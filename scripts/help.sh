#!/bin/bash
BASE_DIR="/usr/local/share/cpserver/commands"

# Check if a subcommand is provided
echo "Usage: cpserver <subcommand> [options]"
echo "Available subcommands:"
ls "$BASE_DIR" | sed 's/.sh$//'
exit 1
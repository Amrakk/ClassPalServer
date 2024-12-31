#!/bin/bash

# Completion function for the main cpserver command (listing subcommands)
_cpserver_complete() {
  local cur subcommands
  cur="${COMP_WORDS[COMP_CWORD]}"

  # List subcommands (without .sh extension)
  subcommands=$(find /usr/local/share/cpserver/commands -maxdepth 1 -type f -executable -exec basename {} \; | sed 's/.sh$//')

  # If we're completing the subcommand (second word, after cpserver)
  if [[ ${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "$subcommands" -- "$cur") )
  fi

  if [[ ${COMP_CWORD} -eq 2 && ( "${COMP_WORDS[1]}" == "run-dev" || "${COMP_WORDS[1]}" == "build" ) ]]; then
    COMPREPLY=( $(compgen -d -S "/" -- "$cur" ) )
    [[ ${#COMPREPLY[@]} -gt 0 ]] && compopt -o nospace
  fi
}

# Register the completion function for the cpserver main command
complete -F _cpserver_complete cpserver

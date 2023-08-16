#!/usr/bin/env bash
set -e

currentHooksPath=$(git config core.hooksPath || true)

if [[ $currentHooksPath == ".husky" ]]; then
  if [ -z "$SILENT" ]; then
    echo "Unsetting git hooks path because it was previously set to .husky."
    echo "If you had custom git hooks in .husky you may want to move them to .git/hooks"
  fi

  git config --unset core.hooksPath
fi

oldHuskyHookNames=(
  "applypatch-msg"
  "commit-msg"
  "post-applypatch"
  "post-checkout"
  "post-commit"
  "post-merge"
  "post-receive"
  "post-rewrite"
  "post-update"
  "pre-applypatch"
  "pre-auto-gc"
  "pre-merge-commit"
  "pre-push"
  "pre-rebase"
  "pre-receive"
  "push-to-checkout"
  "sendemail-validate"
  "update"
)

for hookName in "${oldHuskyHookNames[@]}"; do
  hookPath=".git/hooks/$hookName"

  if [[ -f $hookPath ]]; then
    if grep -q husky "$hookPath"; then
      newHookPath="$hookPath.old"
        if [ -z "$SILENT" ]; then
          echo "Renaming old husky hook $hookPath to $newHookPath"
        fi

      mv "$hookPath" "$newHookPath" --suffix=old --backup=numbered
    fi
  fi
done

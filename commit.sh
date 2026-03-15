#!/bin/sh
# One commit per changed file with auto-generated English message.
set -e

while true; do
  line=$(git status --porcelain | head -n1)
  [ -z "$line" ] && break

  if echo "$line" | grep -q ' -> '; then
    path="${line#* -> }"
    msg="refactor: rename to $path"
  else
    path=$(echo "$line" | cut -c4-)
    case "$line" in
      '??'*) msg="feat: add $path" ;;
      *D*|D*) msg="chore: remove $path" ;;
      *)      msg="chore: update $path" ;;
    esac
  fi

  git add "$path" 2>/dev/null || git add -u "$path" 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    git reset HEAD -- "$path" 2>/dev/null || true
    break
  fi
  git commit -m "$msg"
done

if git status --short | grep -q .; then
  echo "Some changes could not be committed (e.g. merge conflicts)."
else
  echo "Done. All changes committed (one commit per file)."
fi

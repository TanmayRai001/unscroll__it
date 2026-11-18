#!/usr/bin/env bash
# Installs this skill library into ~/.claude/skills (global for Claude Code).
#   1. Copies every personal skill in this folder (any dir containing SKILL.md).
#   2. Fetches the reviewed community skills at the exact commits that were reviewed.
#   3. Installs Anthropic's commit-commands plugin if the `claude` CLI is present.
# Re-running is safe: each skill folder is replaced with the pinned version.
# Usage: bash claude-skills/install.sh [--personal-only]
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$DEST"

echo "→ Personal skills → $DEST"
for dir in "$HERE"/*/; do
  name="$(basename "$dir")"
  [ -f "$dir/SKILL.md" ] || continue
  rm -rf "${DEST:?}/$name"
  cp -R "$dir" "$DEST/$name"
  echo "  ✓ $name"
done

[ "${1:-}" = "--personal-only" ] && exit 0

# repo | pinned commit | path inside repo | installed name
COMMUNITY=(
  "pbakaus/impeccable|d41d9860b0094dcb68030657da63461212835aaa|.claude/skills/impeccable|impeccable"
  "Leonxlnx/taste-skill|f6b76575f949707b4e3c37cd86cb44b0b98643e8|skills/taste-skill|design-taste-frontend"
  "greensock/gsap-skills|aed9cfd3277740755f6bfc1155c7aa645403b760|skills/gsap-core|gsap-core"
  "greensock/gsap-skills|aed9cfd3277740755f6bfc1155c7aa645403b760|skills/gsap-scrolltrigger|gsap-scrolltrigger"
  "freshtechbro/claudedesignskills|1da73febff0c3e1dfefc07f8a5ef8f7d1dfdb6cd|.factory/skills/react-three-fiber|react-three-fiber"
  "alirezarezvani/claude-skills|f8593c4941210a621a6629ce1da9e07897976d5f|engineering-team/a11y-audit/skills/a11y-audit|a11y-audit"
  "wshobson/agents|42203085cfc5736204bf0f6d436dff7e1da0bf3f|plugins/frontend-mobile-development/skills/tailwind-design-system|tailwind-design-system"
)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Community skills (pinned)"
for entry in "${COMMUNITY[@]}"; do
  IFS='|' read -r repo sha path name <<<"$entry"
  src="$TMP/${repo//\//__}"
  if [ ! -d "$src/.git" ]; then
    git init -q "$src"
    git -C "$src" remote add origin "https://github.com/$repo.git"
  fi
  git -C "$src" fetch -q --depth 1 origin "$sha"
  git -C "$src" checkout -q FETCH_HEAD -- "$path"
  rm -rf "${DEST:?}/$name"
  cp -R "$src/$path" "$DEST/$name"
  echo "  ✓ $name  ($repo@${sha:0:7})"
done

if command -v claude >/dev/null 2>&1; then
  echo "→ Plugin: commit-commands"
  claude plugin install commit-commands@anthropic-plugin-directory \
    || claude plugin install commit-commands@claude-plugins-official \
    || echo "  ! install it from /plugin inside Claude Code"
fi

echo "Done. $(find "$DEST" -maxdepth 2 -name SKILL.md | wc -l) skills in $DEST"

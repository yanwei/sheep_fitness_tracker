#!/usr/bin/env bash
# 把 frontend/ 发布到 frontend-dist/（对外目录），排除开发文件。
# 用法:
#   ./deploy-frontend.sh --dry-run   预览将要变更的文件，不做任何修改
#   ./deploy-frontend.sh             正式同步
set -euo pipefail

SRC="/opt/sheep_fitness_tracker/frontend"
DST="/opt/sheep_fitness_tracker/frontend-dist"

OPTS=(-a --delete
      --exclude 'server.js'
      --exclude 'test.html'
      --exclude 'test-*.js'
      --exclude '*.bak'
      --exclude '.git'
      --exclude '.gitignore'
      --exclude 'node_modules'
      --exclude '__pycache__')

if [[ "${1:-}" == "--dry-run" ]]; then
  OPTS+=(--dry-run -v)
  echo "[dry-run] $SRC -> $DST (不修改任何文件)"
else
  echo "[deploy] $SRC -> $DST"
fi

mkdir -p "$DST"
rsync "${OPTS[@]}" "$SRC"/ "$DST"/

if [[ "${1:-}" != "--dry-run" ]]; then
  chmod -R a+rX "$DST"
  echo "[done] 已同步并修正权限(目录 755/文件 644)"
fi

#!/usr/bin/env bash

set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
images_dir="$repo_dir/images"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is required but was not found." >&2
  exit 1
fi

if [[ ! -d "$images_dir" ]]; then
  echo "Error: images directory not found at $images_dir" >&2
  exit 1
fi

docker run --rm \
  --env HOST_UID="$(id -u)" \
  --env HOST_GID="$(id -g)" \
  --volume "$images_dir:/images" \
  alpine \
  sh -ceu '
    apk add --no-cache libwebp-tools >/dev/null

    find /images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 |
      while IFS= read -r -d "" source; do
        output="${source%.*}.webp"
        echo "Converting ${source#/images/} -> ${output#/images/}"
        cwebp -quiet -mt -q 80 "$source" -o "$output"
        chown "$HOST_UID:$HOST_GID" "$output"
      done
  '

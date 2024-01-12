#!/usr/bin/env sh

set -e

IMAGE="ns-user-manager:dist"

podman build --tag "$IMAGE" --target dist --force-rm --layers .
container_id=$(podman create "$IMAGE" /)
trap 'podman rm -f $container_id' EXIT
trap 'podman image rm -f $IMAGE' EXIT
rm -fr dist
mkdir -p dist
podman export "$container_id" | tar --extract --overwrite --directory dist

#!/usr/bin/env sh

set -e

dev_image=${DEV_IMAGE:-"ns-user-manager"}
container_name=ns-user-manager

build_image() {
    podman build \
        --force-rm \
        --layers \
        --target "$1" \
        --tag "$2" \
        .
}

if [ "$1" = "build" ]; then
    build_image "dev" "$dev_image"
    exit 0
fi

if [ "$1" = "preview" ]; then
    build_image "build" "$dev_image:build"
    podman run \
        --rm \
        --interactive \
        --tty \
        --publish 4173:4173 \
        "$dev_image:build" \
        npm run preview
    exit 0
fi


if ! podman image exists "$dev_image"; then
    build_image "dev" "$dev_image"
fi

# params given will be appended at the end of the command
commands_given="$*"
shift "$#"

if podman container exists $container_name; then
  set -- "$@" podman exec --interactive --tty $container_name
else
  set -- "$@" podman run \
    --name $container_name \
    --replace \
    --rm \
    --interactive \
    --tty \
    --publish 5173:5173 \
    --volume "$(pwd)":/app:Z \
    "${dev_image}"
fi

# if commands_given are not zero, append them
if [ -n "$commands_given" ]; then
  for command in $commands_given; do
    set -- "$@" "$command"
  done
fi

"$@"

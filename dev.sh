#!/usr/bin/env sh

set -e

dev_image=${DEV_IMAGE:-"ns-user-manager-dev:20.10.0"}
container_name=ns-user-manager-dev

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
        --network host \
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

# setup podman command
set -- "$@" podman

if podman container exists $container_name; then
  # base command to execute in container
  set -- "$@" exec
  # if terminal is interactive, add interactive and tty flags
  if [ -t 0 ]; then
    set -- "$@" --interactive --tty
  fi
  # add container name
  set -- "$@" $container_name
else
  # base command to create container
  set -- "$@" run --name $container_name --replace --rm --volume "$(pwd)":/app:Z --network host
  # if terminal is interactive, add interactive and tty flags
  if [ -t 0 ]; then
    set -- "$@" --interactive --tty
  fi
  # add image name
  set -- "$@" "$dev_image"
fi

# if commands_given are not zero, append them
if [ -n "$commands_given" ]; then
  for command in $commands_given; do
    set -- "$@" "$command"
  done
fi

"$@"

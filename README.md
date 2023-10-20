# NS8 User Manager

FrontEnd manager for AD/LDAP installed in NS8.

## Development

To develop and build the UI, you'll just need [podman](https://podman.io/) to be installed. Everything will be run
inside a container, to keep at minimum dependency discrepancies between developers.

The script `dev.sh` is provided to ease the development.

### Booting up the UI

To boot the UI, simply run

```shell
./dev.sh
```

This will build the development container (if not already built), and run the UI in development mode. You'll find it
served at http://localhost:5173. The UI will be hot-reloaded on any change.

### Accessing the container

The container can execute different commands, simply put them after the `dev.sh` command. I.E. to access the container's
shell, run

```shell
./dev.sh bash
```

Or, to run `npm` without accessing the container, you can:

```shell
./dev.sh npm run lint
```

The command `build` is a special one, rebuilds the development container even if it already exists.

## Build

To build the UI, simply run `./build.sh`, this will build the UI in isolated environment, the result will be put in
the `dist` folder.

## License

All the repo is licensed under [GPL 3.0 or later](LICENSE) license.
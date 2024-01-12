# NS8 User Manager

FrontEnd manager for AD/LDAP installed in NS8.

## Development

To develop and build the UI, you'll just need [podman](https://podman.io/) to be installed. Everything will be run
inside a container, to keep at minimum dependency discrepancies between developers.

The script `dev.sh` is provided to ease the development.

### Setup

#### Server side

Before starting, you'll need to edit the `api-moduled.service` in your nethserver installation and change
from `Environment=GIN_MODE=release` to `Environment=GIN_MODE=debug`. This will take care of every CORS policy issues.

The file can be found under `/etc/systemd/user/api-moduled.service`. If you edited the file after installing any domain
related module, remember to access the module you want to develop on and run `systemctl --user daemon-reload` and
then `systemctl --user restart api-moduled`.

#### Client side

Client side, copy the [`.env.development.example`](.env.development.example) and rename it `.env.development`.

In there you'll find the `VITE_ENDPOINT` variable, it needs to be filled with the domain URL
(I.E. `https://<ip/fqdn of NS8>/users-admin/<domain inserted during domain setup>`).

You can then leave the file there or edit it if needed, it won't be included in the final build. 

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

## Runtime Configuration

You can configure the following sections of the application by placing a `config.json` file in the same directory as
the `index.html` once the build is completed:

- `domain`: Domain to be shown in the login page and on the top right of the interface;
- `services`: An array of strings that lists the services that this domain is attached to. They will be displayed (after
  they're passed through the translator) as bullet point list in the `Account Page` under `Change Password`.

Example:

```json
{
  "domain": "samba.com",
  "services": [
    "nethvoice",
    "nethservice"
  ]
}
```

Note: if you're using the development environment and you've set the .env.development file, the file must be put inside
the `public` folder of the module that you're using. (I.E. `/home/samba1/.config/api-moduled/public/config.json`)

## License

All the repo is licensed under [GPL 3.0 or later](LICENSE) license.
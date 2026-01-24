# Approvio CLI

The Approvio CLI is a command-line interface for managing the Approvio platform. It provides tools for authentication, user & agent management, and workflow creation and interaction.


## Authentication

The CLI supports both human user and agent authentication. Profiles and tokens are stored locally in `~/.approvio/config.json`.

### Login

Log in as a human user using OpenID Connect (OIDC).

```bash
approvio auth login --endpoint <APPROVIO_API_ENDPOINT>
```

The CLI will provide a URL for you to visit in your browser. After logging in, you will receive a token to paste back into the terminal.

### Register Agent

Register an existing agent with local configuration by providing its credentials and keys.

```bash
approvio auth register-agent \
  --name <AGENT_NAME> \
  --private-key <PATH_TO_PRIVATE_KEY> \
  --public-key <PATH_TO_PUBLIC_KEY> \
  --endpoint <APPROVIO_API_ENDPOINT>
```

### Authentication Status

View the current authentication status, active profile, and token expiration.

```bash
approvio auth status
```

### Logout

Clear all stored credentials and profiles.

```bash
approvio auth logout
```

## Agent Management

### Create Agent

Create a new agent in the system. This command automatically generates a new RSA key pair and saves the `.pem` files to your current directory.

```bash
approvio agent create --name <AGENT_NAME>
```

## User Management

### List Users

Display a list of users registered in the system.

```bash
approvio user list [options]
```

**Options:**

- `-s, --search <query>`: Search for users by name or email.
- `-p, --page <number>`: Specify the page number (default: 1).
- `-l, --limit <number>`: Set the number of results per page (default: 20).

## Configuration

Configuration data is persisted in a JSON file located at:
`~/.approvio/config.json`

This file includes your active profile and any stored authentication tokens.

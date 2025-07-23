# Camp Mamo T-Shirt Demo

This project is a demonstration of how to create and deploy a simple dApp on an EVM-compatible rollup using Initia and Celestia.

## Overview

The dApp is a simple storefront for purchasing a "Camp Mamo T-Shirt" NFT.

## Components

*   **Smart Contract:** An ERC-721 contract for the t-shirt NFT.
*   **Frontend:** A React-based storefront to interact with the contract.
*   **Rollup:** A local MiniEVM rollup using Celestia for Data Availability.

## Instructions

_(To be filled in as we build the demo)_

## Local Development with Weave

This project provides a Docker-based environment to ensure all `weave` CLI operations are consistent and self-contained. This is the recommended approach as it isolates the demo's configuration and deployment from other projects on your system.

Alternatively, you can use a standard `weave` installation by following the official instructions [here](https://docs.initia.xyz/developers/developer-guides/tools/clis/weave-cli/installation).

### The `campmamo` and `weave` Commands

This project uses a wrapper script to manage a self-contained `weave` environment directly on your local machine. This avoids conflicts with other `weave`-based projects and ensures all data for this demo is stored within the project directory.

The script provides two core commands: `weave` and `campmamo`.

**Installation:**

To make the commands available system-wide, run the installer from the project root (you may need to make it executable first with `chmod +x campmamo_wrapper.sh`):

```bash
./campmamo_wrapper.sh install
```

This will create two symbolic links in `/usr/local/bin`, allowing you to run `weave` and `campmamo` from any directory.

**Usage Workflow:**

1.  **Initialize the Project:** Before doing anything else, initialize the environment from the project root. This creates a hidden `.weave-home` directory to store all project-specific data.

    ```bash
    campmamo init
    ```

2.  **Use `weave` as Normal:** For all standard operations, use the `weave` command. It will automatically run within the isolated project environment. For example:
    *   `weave keys add my-key`
    *   `weave build`
    *   `weave rollup start -d`
    *   `weave --help` (will show the standard `weave` help)

3.  **Use `campmamo` for Special Operations:** The `campmamo` command is used for managing the environment itself.

    *   `campmamo install`: Installs the tool.
    *   `campmamo uninstall`: Removes the tool.
    *   `campmamo init`: Initializes the project environment.
    *   `campmamo run <binary> [args...]`: Executes other binaries that are part of the `weave` ecosystem from within the project's context. This is useful for advanced debugging or direct interaction. For example:
        *   `campmamo run opinitd status`
        *   `campmamo run hermes keys list --chain init-1`
        *   `campmamo run minitiad version`

# Discord Package

This package is a POC for controlling the Discord client. In order to make it work, you have to create an app and copy the oath2 `clientId` and `clientSecret` values into the package. In this package right now the *input* and *output* are controlled.

## Overview

Packages for the Grid Editor generally consists of two parts:

- The main JavaScript module containing the logic of the package. The code runs in a NodeJS environment with no special restrictions. The package can communicate with the Editor core through a special interface.
- A preferences panel window shown in the Preferences pane. The code for the preferences **must** be a single HTML page. This is run in the renderer process of the Electron application. The preferences panel can request a MessagePort to communicate with the NodeJS part of the package.

## Installation

After this package is in the right folder, run `npm install` to download the necessary node modules.

Packages are run from the `packages` folder of the Grid Editor user data folder (by default, found inside the 'Document' folder under `grid-userdata`). Each package can be found inside it's separate folder.

The sample project repository can be directly cloned into the packages folder. The package should then be shown inside the packages list in the Preferences window pane.

When developing a package, changes can be seen depending on what is being modified:

- For the NodeJS module, changes are **only** applied after the Editor is restarted.
- Changes in the preferences window can be seen after a package disable-enable cycle.

## Know-how

This package is based on `discord-rpc` which seems to be abandoned. Consider changing to this version: https://www.npmjs.com/package/@xhayper/discord-rpc, includes snap support, probably better under linux?



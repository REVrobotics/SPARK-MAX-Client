# SPARK MAX Client
## Overview
This repository is for the front-end client application of the SPARK MAX Motor Controller. Any IDE/IDEA that supports [Node.js](https://www.nodejs.org) development is recommend.
Major node modules that were used to build this application were [electron.js](https://electronjs.org), [react](https://reactjs.org/), and [TypeScript](https://www.typescriptlang.org/).
Application packaging is all done by [electron-builder](https://github.com/electron-userland/electron-builder).

## Folder Structure
Parts of the project structure were created by [create-react-app](https://github.com/facebook/create-react-app), and the other directories were created in need of separation.
* **/bin**: All binary files such as the sparkmax server that need to be bundled with the application to be loaded at runtime.
* **/public**: Any files that are 'technically' made public to the user such as .html files and library css files. Electron's main process scripts also lie within the 'main' sub-folder.
* **/res**: Spare resource files. These aren't bundled with the application, but are rather extra, or used for the packaging process itself.
* **/src**: All project source files. The only types of files within this directory are TypeScript (.ts) files, and React TypeScript (.tsx) files.

## Project Setup
1. First, make sure you have the latest version of [Node.js](https://www.nodejs.org) installed. The SPARK MAX Client was built using Node v10.
2. Clone this repository into any desired directory.
3. Open up a command prompt or terminal window, and type `npm install` from the project root directory.
4. Once the project has installed it's dependencies, run `npm start` to start both the react development server and the desktop electron environment.

## Generation of gRPC client from .proto files
Project includes helper script which simplifies gRPC client generation based on .proto files.
This script downloads file from GitHub repository and generates gRPC client using protoc tool.
 
1. To download .proto files from repository provide all settings into `scripts/proto-gen/proto-gen.config.js`.
2. It is recommended to provide all sensitive settings into `proto-gen.secret.js` or `proto-gen.secret.json` file. Secret file will be not committed into Git.
    1. Copy `scripts/proto-gen/proto-gen.secret-sample.js` file and rename it either to `proto-gen.secret.json` or `proto-gen.secret.js`.
3. Run
    ```
    npm run proto-gen
    ```

**Note.** Look at comments in [scripts/proto-gen/proto-gen.config.js](proto-gen.config.js) file to understand how to tune generation process.  

## Project Scripts
### `npm run react`
This starts the react TypeScript development server only. When this window loads, an error will display saying 'window.require is not a function'.
This is okay, because the application itself is an electron desktop application, and a typical browser doesn't have the necessary libraries that electron has.

### `npm run desktop`
This starts the electron desktop environment. Without the react development server, this window will display a blank, white screen.
It is recommended to first start the react server, and then run the desktop environment.

### `npm run build`
This script builds the react source files from the `src` directory.

### `npm run build-desktop`
This script builds the desktop environment's main process files from `public/main`.
Make sure all production variables are set to 'true' if you plan on making a production build.

### `npm run dist`
This script is responsible for packaging all of the SPARK MAX Client's project files into a distributable format.
Most of this is done by the [electron-builder](https://github.com/electron-userland/electron-builder) module. Out of all the scripts,
this one takes the most time to complete (approx. 5 minutes). It should also be noted that this runs `npm run build` and `npm run build-desktop` before the actual script itself.

### `npm install`
This is the typical, default installation command that the node package manager has. The SPARK MAX Client has a `npm run postinstall` script that is automatically
run after `npm install` is finished, which builds the proper binaries for the electron environment. This provides native access to operating system calls such as
the file system.

## Using gulp.js
The SPARK MAX Client repository comes with some pre-built gulpfile commands that may help during development.

### 

## SPARK MAX Client Changelog
For detailed descriptions on what's changed between versions, head over to the repository's [CHANGELOG.md](https://github.com/REVrobotics/SPARK-MAX-Client/blob/master/CHANGELOG.md).
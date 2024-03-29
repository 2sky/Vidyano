# Vidyano

[![Build status](https://2sky.visualstudio.com/Vidyano/_apis/build/status/Vidyano-CI)](https://2sky.visualstudio.com/Vidyano/_build/latest?definitionId=4) [![Gitter](https://badges.gitter.im/Vidyano/community.svg)](https://gitter.im/Vidyano/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

*[Vidyano](http://www.vidyano.com) is .NET based application platform for building data-driven applications.*

For instructions about _using_ Vidyano to develop applications, please refer to [www.vidyano.com](http://www.vidyano.com)

# Legacy Repo
This repository is only for informational purposes as all development has been moved to the Web3 client at https://github.com/Vidyano/vidyano

# What is Vidyano Web²
This legacy repository contains the complete code for our next generation web client, **Vidyano Web²**. It provides an out of the box, scaffolded, modern Single Page Application (SPA) that interacts with a Vidyano backend.

## Table of Contents
*The following is a table of contents for the documentation found in the docs folder of this repository.*

* [Overview](docs/overview.md)
* [Project Structure](docs/project-structure.md)
* [Web Component Structure](docs/web-component-structure.md)
* [Custom Templates](docs/custom-templates.md)
* [Session Presenter](docs/session-presenter.md)

## How to run this repository
**1. Prerequisites**
- Install [Docker](https://www.docker.com/) installed on your system and make sure Linux containers are enabled.

- Install [Visual Studio Code](https://code.visualstudio.com/)
    - Install the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

- Install [.NET Core 3.1](https://dotnet.microsoft.com/download/dotnet-core/3.1)

- Create/Export your self-signed developer certificate
    ```sh
    // On Windows (via PowerShell)
    dotnet dev-certs https --trust; dotnet dev-certs https -ep "$env:USERPROFILE/.aspnet/https/aspnetapp.pfx" -p "923639d6-6d5a-4b2b-92b8-9a0cf8557eee"

    // On MacOS/Linux (via Terminal)
    dotnet dev-certs https --trust; dotnet dev-certs https -ep "${HOME}/.aspnet/https/aspnetapp.pfx" -p "923639d6-6d5a-4b2b-92b8-9a0cf8557eee"
    ```

**2. Opening the development container**
    
- Clone https://github.com/2sky/vidyano locally and make sure the drive is shared in Docker.

- Start VS Code

- Run the ```Remote-Containers: Open Folder in Container...``` command and select the local folder

**3. Using your new Vidyano Web² development code in an existing Vidyano applicaiton**

In the ```web.config``` of your Vidyano application, add a new ```appSetting``` :
```xml
<add key="Vidyano.Web2Version" value="https://localhost:8888" />
```

## Tested using BrowserStack Automated Testing

Vidyano is constantly tested on real browsers using BrowserStack.
Big thanks to BrowserStack for providing this testing environment to us.

[![BrowserStack](/test/browserstack-logo-600x315.png)](http://browserstack.com/)

## Copyright and license

Code and documentation copyright 2011-2024 2sky NV. Code released under the MIT license available [here](./LICENSE)

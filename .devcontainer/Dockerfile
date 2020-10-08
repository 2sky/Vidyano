#-------------------------------------------------------------------------------------------------------------
# Copyright (c) 2020 2sky. All rights reserved.
# Licensed under the MIT License.
#-------------------------------------------------------------------------------------------------------------

FROM mcr.microsoft.com/vscode/devcontainers/dotnetcore:0-3.1

RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs git  && \
    apt-get install dos2unix && \
    npm install -g bower && \
    npm install -g grunt && \
    npm install -g --unsafe-perm node-sass && \
    npm rebuild node-sass
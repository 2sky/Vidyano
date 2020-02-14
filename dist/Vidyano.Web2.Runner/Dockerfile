#-------------------------------------------------------------------------------------------------------------
# Copyright (c) 2020 2sky. All rights reserved.
# Licensed under the MIT License.
#-------------------------------------------------------------------------------------------------------------

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["Vidyano.Web2.Runner.csproj", ""]
RUN dotnet restore "./Vidyano.Web2.Runner.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "Vidyano.Web2.Runner.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Vidyano.Web2.Runner.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install Node 10
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs git  && \
    npm install -g bower && \
    npm install -g grunt && \
    npm install -g --unsafe-perm node-sass && \
    npm rebuild node-sass

ENTRYPOINT ["dotnet", "Vidyano.Web2.Runner.dll"]
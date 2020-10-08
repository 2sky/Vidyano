npm install
grunt
dotnet build "dist/Vidyano.Web2.Build/Vidyano.Web2.Build.csproj" -c Release
dotnet build "dist/Vidyano.Web2.Runner/Vidyano.Web2.Runner.csproj" -c Release -o /app
((dotnet /app/Vidyano.Web2.Runner.dll > /vidyano/web2-runner-log.txt) &)
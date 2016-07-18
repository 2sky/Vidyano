@echo off
set config=Release

set nuget=
if "%nuget%" == "" (
	set nuget=.nuget\nuget.exe
)

set vidyanoFullVersion=%1
if not "%2" == "" (
	set vidyanoFullVersion=%1-%2
)

pushd ..\..\
call npm update
call bower update
call grunt nuget --vidyano-version=%1 --vidyano-version-prerelease=%2
popd

"C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" ..\Vidyano.Web2.sln /t:Rebuild /p:Configuration="%config%" /m /v:M /fl /flp:LogFile=msbuild.log;Verbosity=Normal /nr:false

%nuget% pack Vidyano.Web2.Definition.nuspec -Version %vidyanoFullVersion% -NoPackageAnalysis -verbosity detailed -o . -p Configuration="%config%"
%nuget% pack "Vidyano.Web2.csproj" -NoPackageAnalysis -verbosity detailed -o . -p Configuration="%config%"

pushd ..\..\
call grunt nugetrevert --vidyano-version=%1 --vidyano-version-prerelease=%2
popd
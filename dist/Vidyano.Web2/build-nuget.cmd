@echo off
set config=Release

set nuget=
if "%nuget%" == "" (
	set nuget=..\.nuget\nuget.exe
)

set vidyanoFullVersion=%1
if not "%2" == "" (
	set vidyanoFullVersion=%1-%2
)

pushd ..\..\
call grunt nuget --vidyano-version=%1 --vidyano-version-prerelease=%2
popd

"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe" ..\Vidyano.Web2.Build\Vidyano.Web2.Build.csproj /t:Rebuild /p:Configuration="%config%" /m /v:M /fl /flp:LogFile=msbuild.log;Verbosity=Normal /nr:false
call ..\Vidyano.Web2.Build\bin\%config%\Vidyano.Web2.Build.exe %cd%\src\WebComponents
"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe" ..\Vidyano.Web2\Vidyano.Web2.csproj /t:Rebuild /p:Configuration="%config%" /m /v:M /fl /flp:LogFile=msbuild.log;Verbosity=Normal /nr:false

%nuget% pack Vidyano.Web2.Definition.nuspec -NoPackageAnalysis -verbosity detailed -outputdirectory . -p Configuration="%config%"
%nuget% pack "Vidyano.Web2.csproj" -NoPackageAnalysis -verbosity detailed -outputdirectory . -p Configuration="%config%"

pushd ..\..\
call grunt nugetrevert --vidyano-version=%1 --vidyano-version-prerelease=%2
popd
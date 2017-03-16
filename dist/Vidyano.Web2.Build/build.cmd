@echo off

set nuget=
if "%nuget%" == "" (
	set nuget=..\.nuget\nuget.exe
)

"C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" Vidyano.Web2.Build.csproj /t:Rebuild /p:Configuration="Release" /m /v:M /fl /flp:LogFile=msbuild.log;Verbosity=Normal /nr:false
%nuget% pack "Vidyano.Web2.Build.csproj" -NoPackageAnalysis -verbosity detailed -o . -p Configuration="Release"
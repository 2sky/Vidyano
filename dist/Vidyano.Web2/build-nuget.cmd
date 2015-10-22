@echo off
set config=%1
if "%config%" == "" (
   set config=Release
)
 
set nuget=
if "%nuget%" == "" (
	set nuget=.nuget\nuget.exe
)

pushd ..\..\
call npm update
call bower update
call grunt
popd

"C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" Vidyano.Web2.sln /t:Rebuild /p:Configuration="%config%" /m /v:M /fl /flp:LogFile=msbuild.log;Verbosity=Normal /nr:false
 
%nuget% pack "Vidyano.Web2.nuspec" -NoPackageAnalysis -verbosity detailed -o . -p Configuration="%config%"
param($installPath, $toolsPath, $package, $project)

$url = "https://github.com/2sky/Vidyano/blob/master/dist/readme.md"
$dte2 = Get-Interface $dte ([EnvDTE80.DTE2])
$dte2.ItemOperations.Navigate($url) | Out-Null
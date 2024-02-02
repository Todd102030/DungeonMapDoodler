@echo off
setlocal enabledelayedexpansion


for /r %%i in (*) do (
    set "fname=%%~nxi"
    set "name=!fname:-= !"
    set "name=!name:.svg=!"
    :echo %%i
    :echo !fname!
    :echo !name!
    echo {
    echo		path:'stamps/weapons/!fname!',
    echo		name: "!name!",
    echo		alias: "monster",
    echo		group: StampGroup.Weapons,
    echo		defMult: 1,
    echo	},
)


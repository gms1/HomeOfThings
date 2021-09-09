# issues

## testing nestjs-sqlite3 failed on [TravisCI](https://app.travis-ci.com/github/gms1/HomeOfThings/builds/237212721)

can be reproduced by setting maxWorkers to 1

[workaround][https://github.com/gms1/HomeOfThings/commit/45aab8fc7e0e54a78cdd9e89874a7d2ed657da15]

## typescript 4.4 by default uses a `unknown` type for catch variables if the `strict` option is activated

and does not allow any other type annotation.

Using type guards on any catch which assumes that the catch variable is of type `Error` would be too painful

> TODO: set `useUnknownInCatchVariables` to false as soon as we upgrade to typescript 4.4

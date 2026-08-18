# CHANGELOG for jsonpointerx

## 1.2.7

- feat: enable ESM Jest mode across all packages

## 1.2.1 - 1.2.7

- maintenance release

## 1.2.0

- refactor: moved to new repository

## 1.1.2 - 1.1.6

- maintenance release

## 1.1.1

- feat: Support for blacklisting certain JSON pointer segments
- fix!: `__proto__` and `prototype` are blacklisted by default

## 1.0.28 - 1.0.29

- maintenance release

## 1.0.27

- chore: downgraded typescript to <3.7 because of breaking change in minor version

## 1.0.12 - 1.0.26

- maintenance release

## 1.0.11

- fix: setting a value by the special '-' reference token for JSON arrays

## 1.0.7 - 1.0.10

- maintenance release

## 1.0.5 - 1.0.6

- feat: added 'noCompile' option to globally disable the use of `new Function('..')`
- chore: removed '\*.js.map' from .npmignore

## 1.0.4

- fix: static JsonPointer.get was broken

## 1.0.3

- feat: added 'root' and 'segments' property getters

## 1.0.2

- fix: rename UMD bundle to jsonpointerx.umd.js

## 1.0.1

- feat: additional package formats: ESM and UMS bundle

## 1.0.0

- feat: initial release

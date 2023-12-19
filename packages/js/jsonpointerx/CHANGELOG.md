# CHANGELOG

## 1.2.0

- refactor: moved to new repository

## 1.1.2 - 1.1.6

- maintenance release

## 1.1.1

- feature: Support for blacklisting certain JSON pointer segments
- breaking change: `__proto__` and `prototype` are blacklisted by default

## 1.0.28 - 1.0.29

- maintenance release

## 1.0.27

- downgraded typescript to <3.7 because of breaking change in minor version
  https://github.com/microsoft/TypeScript/issues/33939

## 1.0.12 - 1.0.26

- maintenance

## 1.0.11

- **Fix**
  - setting a value by the special '-' reference token for JSON arrays

## 1.0.7 - 1.0.10

- maintenance

## 1.0.5 - 1.0.6

- **Feature**
  - added 'noCompile' option to globally disable the use of `new Function('..')`
  - removed '\*.js.map' from .npmignore

## 1.0.4

- **Fix**
  - static JsonPointer.get was broken

## 1.0.3

- **Features**
  - added 'root' and 'segments' property getters

## 1.0.2

- **Fix**
  - rename UMD bundle to jsonpointerx.umd.js

## 1.0.1

- **Features**
  - additional package formats: ESM and UMS bundle

## 1.0.0

- **Features**
  - initial release

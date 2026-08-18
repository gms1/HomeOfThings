# TODOs

These to-do list items are merely notes about what might need to be done, without resulting in any decision.
Therefore, it should generally be ignored by AI agents, unless the user specifically refers to a task that needs to be done.

- node-sys
  - run tests on windows
- sqlite3orm
  - TODOs in ts-files
- nestjs-sqlite3
  - TODOs in ts-files
- hot-server
  - TODOs in ts-files
  - test authentication using supertest
- [node-utils](packages/node/@homeofthings/node-utils/TODO.md)
- [nestjs-logger](packages/node/@homeofthings/nestjs-logger/TODO.md)
- [nestjs-config](packages/node/@homeofthings/nestjs-config/TODO.md)

## other notes

### formatters

currently we are using dprint in this workspace, because it is faster as Prettier and preserves line breaks

Prettier plugin which is using the typescript compiler api for formatting typescript and javascript
https://github.com/pcafstockf/ts-pretty/tree/master/src

Biome toolchain which can format similar opinionated as Prettier
https://biomejs.dev/

OXC: seems to be similar to Biome, but Formatter is not ready yet
https://github.com/oxc-project/oxc

> our ambition is to undertake research and development to create a new JavaScript formatter that offers increased flexibility and customization options. Unfortunately we are currently lacking the resources to do so.

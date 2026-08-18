# CHANGELOG for sqlite3orm

## 3.1.1

- chore: add node engine >=24.9.0 to packages with ESM dependencies
- feat: enable ESM Jest mode across all packages

## 3.1.0

- feat: improved parsing column-type and column-constraint

## 3.0.0

- feat!: migrate sqlite3 from deprecated TryGhost/node-sqlite3 to HomeOfThings/node-sqlite3

## 2.7.3 - 2.7.7

- maintenance release

## 2.7.2

- chore: maintenance release upgrade node-sqlite3 5.1.7

## 2.7.1

- maintenance release

## 2.7.0

- chore: upgrade node-sqlite3 5.1.6

## 2.6.4

- maintenance release

## 2.6.3

- chore: upgrade node-sqlite3 5.0.3

## 2.6.2

- feat: selectOne method

## 2.6.1

- feat: BaseDAO option 'ignoreNoChanges': if set to `true` resolve 'updatePartialAll' and 'deleteAll' with `0` if nothing changed

## 2.6.0

- feat: BaseDAO: new 'countAll' method
- feat: BaseDAO: new 'exists' method
- feat: Online Backup introduced in 2.5.2

## 2.5.5

- feat: new feature: online backup support

## 2.5.1 - 2.5.4

- maintenance release

## 2.5.0

- feat: BaseDAO: new `replace` methods for REPLACE command
- feat: BaseDAO: insert modes

## 2.4.18

- fix: query model: binding `false` values using shorthand form

## 2.4.14 - 2.4.17

- maintenance release

## 2.4.14

- feat: improved support for sqlcipher: new database settings for 'key' and 'cipherCompatibility'

## 2.4.2 - 2.4.13

- maintenance release

## 2.4.1

- feat: autoupgrade detection for autoIncrement changes

## 2.4.0

- feat: typesafe queries
- fix!: MetaModel: get\*Statement() methods have been moved to the new QueryModel
- fix!: BaseDAO: protected members have been moved to the new QueryModel

## 2.3.2

- feat: customizable serialize/deserialize; support for date in milliseconds unix epoch

## 2.3.1

- feat: descending index columns

## 2.3.0

- feat: BaseDAO: added partial insert/update/update all, as well as delete all methods

## 2.2.0

- feat: autoupgrade for automatically creating or upgrade tables and indexes in the database

## 2.1.0

- feat: DbCatalogDAO for reading schemas, tables, table-definitions, index-definitions and foreign key-definitions
- feat: SqlDatabaseSettings for applying pragma settings on opening a connection to a database

## 2.0.0

- feat!: support for mapping a table to multiple model classes
- feat!: support for schema qualified table and index names
- feat!: quoted identifiers
- feat!: optional parameter 'isUnique' for the 'index' decorator
- feat!: BaseDAO selectAllChildsOf: same as calling selectAllOf from the child-DAO
- feat!: BaseDAO selectByChild: select the parent of a child
- feat!: BaseDAO selectParentOf: same as selectByChild from the child-DAO
- feat!: debugging utility

## 1.0.0 - 1.0.1

- maintenance release

## 0.0.20 - 0.0.24

- maintenance release

## 0.0.19

- feat: BaseDAO: added selectById/deleteById methods for convenience

## 0.0.15 - 0.0.18

- maintenance release

## 0.0.14

- feat: new @index decorator and create/drop - index methods

## 0.0.13

- feat: BaseDAO: added createTable/dropTable/alterTableAddColumn methods for convenience

## 0.0.10 - 0.0.12

- maintenance release

## 0.0.9

- feat: possibility to map properties of complex type to a database column and serialize/deserialize this properties in JSON format

## 0.0.8

- feat: SqlConnectionPool: allow connections to be garbage-collected if the connection pool is not limited by max-connections

## 0.0.7

- feat: SqlConnectionPool: a new connection pool

## 0.0.6

- fix: BaseDAO: ensure type safety for mapped properties of primitive or Date type

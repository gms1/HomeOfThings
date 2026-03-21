# using SQLCipher

- install sqlcipher or build your own
- rebuild node-sqlite3 using sqlcipher see [building for sqlcipher](https://github.com/gms1/node-sqlite3#building-for-sqlcipher)

e.g for Debian/Ubuntu run:

```bash
sudo apt install sqlcipher libsqlcipher-dev
npm install @homeofthings/sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr --no-save
```

- create test database

```bash
$ sqlcipher ./packages/node/sqlite3orm/src/lib/spec/fixtures/cipher.db
sqlite> PRAGMA key='sqlite3orm';
ok
sqlite> create table TEST (id integer not null primary key autoincrement, col varchar(50));
sqlite> insert into TEST (col) values ('my encrypted test data');
sqlite> select * from TEST;
1|my encrypted test data
sqlite>
```

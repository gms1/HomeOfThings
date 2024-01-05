# CHANGELOG for @homeofthings/nestjs-config

| Release | Notes                                               |
| ------- | --------------------------------------------------- |
| 2.1.0   | please see changes below                            |
| 2.0.1   | maintenance release                                 |
| 2.0.0   | nestjs 10x                                          |
| 1.0.5-6 | maintenance release                                 |
| 1.0.4   | feature: global module and singleton config service |
| 1.0.1-3 | maintenance release                                 |
| 1.0.0   | first version                                       |

## 2.1.0

### feature

- support for reloading configuration
- getConfig: get immutable configuration object for a given key
- getObject and getOptionalObject: get mutable configuration object for a given key

### fix

- parse numbers using parseFloat instead of parseInt

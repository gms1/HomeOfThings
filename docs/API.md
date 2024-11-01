# API for NestJs

NestJs currently supports only a Code First approach, so basically you are supposed to first define the DTOs using @ApiProperty decorators, or you can enable the NestJs swagger plugin, which then can derive these decorations from the Typescript type and additional class-validator declarators.

## [TypeSpec](https://typespec.io/)

Lightweight language for defining APIs and generating standards-compliant API schemas for OpenAPI 3.0, JSON Schema 2020-12 and Protobuf.

The TypeSpec code is about 10% of the size of the generated OpenAPI, so developers quickly understand the entirety of an API and don't have to write those extra lines for OpenAPI.
Using TypeSpec linting the resulting OpenAPI document is one that automatically matches the guidelines, practices, and patterns.

## OpenAPI API first approach

### [@fresha/openapi-codegen-server-nestjs](https://www.npmjs.com/package/@fresha/openapi-codegen-server-nestjs)

seems to be more advanced than @newko/swagger-nestjs-codegen. The DTO objects are using class-transformer.
fails to generate the OAS examples; please see [#111](https://github.com/fresha/api-tools/issues/111)

### [@newko/swagger-nestjs-codegen](https://www.npmjs.com/package/@newko/swagger-nestjs-codegen)

is a Javascript/Non-Typescript project having its own "YAML rules", that are contradicting the OpenAPI specification.

- instead of mapping the OAS type 'integer' to 'number', it assumes the Typescript type is 'integer'
- does not support array as response: [#14](https://github.com/Ryan-Sin/swagger-nestjs-codegen/issues/14)

### [openapi-typescript](https://github.com/drwpow/openapi-typescript)

Tools for consuming OpenAPI schemas in TypeScript.
Not NestJs related, but maybe we can use it as the base for writing our own generator?

## Contract first approach

### [ts-rest](https://github.com/ts-rest/ts-rest)

Producers and consumers which are implemented in Typescript, can share this contract, for others this contract can be converted to an OpenAPI spec, which can then be used by Swagger Codegen to target other languages. Please see [non-ts-clients](https://ts-rest.com/docs/guides/non-ts-clients)

### [nestjs-zod](https://www.npmjs.com/package/nestjs-zod)

more specialized nestjs project with similar download count than @ts-rest/core

## parse and validate JSON

### [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox)

looks promising and is second most popular project

maybe we need this too: [typebox-validators](https://www.npmjs.com/package/typebox-validators)

### [ajv](https://www.npmjs.com/package/ajv)

most popular

### [zod](https://www.npmjs.com/package/zod)

more popular than class-validator

### [class-validator](https://www.npmjs.com/package/class-validator)

## convert schemas

[openapi-schema-to-json-schema](https://www.npmjs.com/package/@openapi-contrib/openapi-schema-to-json-schema)

[json-schema-to-openapi-schema](https://www.npmjs.com/package/@openapi-contrib/json-schema-to-openapi-schema)

[schema2typebox](https://www.npmjs.com/package/schema2typebox)

[@sinclair/typebox-codegen](https://www.npmjs.com/package/@sinclair/typebox-codegen) can be used to convert TypeBox schema to JSON schema, zod, ...

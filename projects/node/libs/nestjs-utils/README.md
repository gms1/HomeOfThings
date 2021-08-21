# HomeOfThings - common utilities for NestJs

[HomeOfThings](https://github.com/gms1/HomeOfThings)

## installation

```bash
npm install @homeofthings/nestjs-utils
```

## Dynamic Modules

easily define your dynamic module:

```Typescript

export const MY_MODULE_OPTIONS_TOKEN = 'MY_MODULE_OPTIONS_TOKEN';
export interface MyModuleOptions {
  ....
}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyModule extends createDynamicRootModule<MyModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {
}
```

> NOTE: additional module properties for 'imports', 'exports', 'providers' or 'controllers' can be passed as second parameter to this function

> NOTE: of course the module can also be global scoped by the @Global() decorator

- use it synchronously:

```Typescript
const myModuleOptions: MyModuleOptions = {
  ...
}

@Module({
  imports: [MyModule.forRoot(MyModule, myModuleOptions)],
})
export class AppModule {}

```

- use it asynchonously:

```Typescript
const myAsyncModuleOptions: AsyncModuleOptions<MyModuleOptions> = {
  ...
}

@Module({
  imports: [MyModule.forRootAsync(MyModule, myAsyncModuleOptions)],
})
export class AppModule {}

```

> NOTE: forRoot/forRootAsync throws if the module is already registered.
> You can call register/registerAsync if you really want to register it more than once

- import it in any child module:

```Typescript
@Module({
  imports: [MyModule.forChild()],
})
export class ChildModule {}
```

> NOTE: no need to do this if the module is global scoped

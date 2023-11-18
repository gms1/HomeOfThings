import { AnyObject, Constructor } from './common-types';

// stolen from https://loopback.io/doc/en/lb4/apidocs.core.mixintarget.html
// https://loopback.io/doc/en/lb4/Mixin.html
export type MixinTarget<T extends AnyObject> = Constructor<
  {
    // Enumerate only public members to avoid the following compiler error:
    //   Property '(name)' of exported class expression
    //   may not be private or protected.ts(4094)
    [P in keyof T]: T[P];
  }
>;

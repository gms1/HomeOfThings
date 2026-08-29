declare module 'semver' {
  function intersects(v1: string, v2: string, optionsOrLoose?: boolean | { loose?: boolean; includePrerelease?: boolean }): boolean;
}

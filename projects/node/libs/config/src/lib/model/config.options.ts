import { ModuleMetadata } from '@nestjs/common';

export type ConfigModuleOptions = {};

export interface ConfigModuleOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<ConfigModuleOptions> | ConfigModuleOptions;
  inject: any[];
}

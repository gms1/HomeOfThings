/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleMetadata, Type } from '@nestjs/common';

export type InjectionToken = string | symbol | Type<any>;

export interface AsyncModuleBasicOptions extends Pick<ModuleMetadata, 'imports' | 'exports' | 'providers'> {
  useFactory: (...args: any[]) => Promise<any> | any;
  inject?: any[];
}

export interface AsyncModuleOptions<T> extends AsyncModuleBasicOptions {
  useFactory: (...args: any[]) => Promise<T> | T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleMetadata, Type } from '@nestjs/common';

export type InjectionToken = string | symbol | Type<any>;

export interface ModuleOptionsFactory<T> {
  createModuleOptions(): Promise<T> | T;
}

export interface AsyncModuleOptions<T> extends Pick<ModuleMetadata, 'imports' | 'exports' | 'providers'> {
  useFactory: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ProjectGraphProjectNode } from '@nx/devkit';

export interface Project extends ProjectGraphProjectNode {
  sourcePackageJsonPath: string;
  sourcePackageJson: any;
  nonPublishableReasons: string[];
  publishable: boolean; // true if the project has package.json, is not private and has a proper version
  published: boolean; // true if the project is publishable, but the current version is already published
  generated: boolean; // true if the project is publishable and the current version is not published and it is built
  outputDir: string;
  outputPackageJson?: any;
}

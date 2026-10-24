import { updatePackageDependencies } from './deps';

describe('updatePackageDependencies', () => {
  const internalPackageVersions = {
    '@homeofthings/node-utils': '1.0.8',
    '@homeofthings/nestjs-utils': '2.1.4',
  };
  const externalPackageVersions = {
    tslib: '^2.8.1',
    debug: '^4.4.3',
    '@homeofthings/sqlite3': '7.0.7',
  };
  const externalPeerDependencyVersions = {
    '@nestjs/common': '^12.2.0',
    '@nestjs/core': '^12.2.0',
  };

  it('should update internal dependencies to ~<version of the internal package>', () => {
    const packageJson = {
      dependencies: {
        '@homeofthings/node-utils': '~1.0.7',
      },
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual([]);
    expect(packageJson.dependencies['@homeofthings/node-utils']).toBe('~1.0.8');
  });

  it('should update external dependencies to the version defined in the root package.json', () => {
    const packageJson = {
      dependencies: {
        '@homeofthings/sqlite3': '7.0.6',
      },
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual([]);
    expect(packageJson.dependencies['@homeofthings/sqlite3']).toBe('7.0.7');
  });

  it('should prefer the peerDependency version for peer dependencies', () => {
    const packageJson = {
      peerDependencies: {
        '@nestjs/common': '^12.1.3',
      },
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual([]);
    expect(packageJson.peerDependencies['@nestjs/common']).toBe('^12.2.0');
  });

  it('should update all dependency sections', () => {
    const packageJson = {
      dependencies: {
        tslib: '^2.8.0',
        '@homeofthings/nestjs-utils': '~2.1.3',
      },
      devDependencies: {
        debug: '^4.4.0',
      },
      peerDependencies: {
        '@nestjs/core': '^12.1.3',
      },
      optionalDependencies: {
        tslib: '^2.8.0',
      },
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual([]);
    expect(packageJson.dependencies['tslib']).toBe('^2.8.1');
    expect(packageJson.dependencies['@homeofthings/nestjs-utils']).toBe('~2.1.4');
    expect(packageJson.devDependencies['debug']).toBe('^4.4.3');
    expect(packageJson.peerDependencies['@nestjs/core']).toBe('^12.2.0');
    expect(packageJson.optionalDependencies['tslib']).toBe('^2.8.1');
  });

  it('should return the names of dependencies which cannot be resolved', () => {
    const packageJson = {
      dependencies: {
        'some-unknown-package': '^1.0.0',
        tslib: '^2.8.0',
      },
      peerDependencies: {
        'another-unknown-package': '^2.0.0',
      },
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual(['some-unknown-package', 'another-unknown-package']);
    expect(packageJson.dependencies['some-unknown-package']).toBe('^1.0.0');
    expect(packageJson.peerDependencies['another-unknown-package']).toBe('^2.0.0');
    // resolvable packages are still updated
    expect(packageJson.dependencies['tslib']).toBe('^2.8.1');
  });

  it('should leave package.json without dependency sections untouched', () => {
    const packageJson = {
      name: 'package-without-deps',
    };
    const unresolved = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);

    expect(unresolved).toEqual([]);
    expect(packageJson).toEqual({ name: 'package-without-deps' });
  });
});

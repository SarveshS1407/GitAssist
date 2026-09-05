import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LicenseDetector } from '../src/core/license-detector.js';

describe('LicenseDetector', () => {
  test('detects MIT license from LICENSE file content', () => {
    const detector = new LicenseDetector();
    const files = [
      {
        relativePath: 'LICENSE',
        content: 'MIT License\nCopyright (c) 2026\nPermission is hereby granted, free of charge...'
      }
    ];

    const result = detector.detect(files);
    assert.strictEqual(result.primaryLicense.id, 'MIT');
    assert.strictEqual(result.primaryLicense.type, 'Permissive');
    assert.strictEqual(result.copyleftRisk, 'LOW');
  });

  test('flags copyleft risk when GPL-3.0 is detected', () => {
    const detector = new LicenseDetector();
    const files = [
      {
        relativePath: 'COPYING',
        content: 'GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007'
      }
    ];

    const result = detector.detect(files);
    assert.strictEqual(result.primaryLicense.id, 'GPL-3.0');
    assert.strictEqual(result.copyleftRisk, 'HIGH');
  });

  test('extracts inline SPDX identifiers from source code', () => {
    const detector = new LicenseDetector();
    const files = [
      {
        relativePath: 'src/module.js',
        content: '// SPDX-License-Identifier: Apache-2.0\nexport const x = 1;'
      }
    ];

    const result = detector.detect(files);
    assert.strictEqual(result.spdxDeclarationsCount, 1);
    assert.strictEqual(result.spdxDeclarations[0].license, 'Apache-2.0');
  });
});
